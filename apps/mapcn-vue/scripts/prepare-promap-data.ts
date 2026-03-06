/**
 * Build-time script to prepare ProMap data from Zillow ZHVI + Census centroids + SimpleMaps population.
 *
 * Run: bun run apps/mapcn-vue/scripts/prepare-promap-data.ts
 *
 * Downloads:
 *   1. Zillow ZHVI CSV (~120MB, 26,300 ZIPs × 322 columns)
 *   2. Census ZIP code centroids CSV (33,144 rows × 3 columns)
 *   3. SimpleMaps US Zips CSV (~3MB, 33,783 rows with population data)
 *
 * Joins on ZIP code and outputs a compact JSON array to:
 *   apps/mapcn-vue/public/data/promap-data.json
 */

const ZHVI_URL =
  'https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv';

const CENTROIDS_URL =
  'https://gist.githubusercontent.com/erichurst/7882666/raw/5bdc46db47d9515269ab12ed6fb2850377fd869e/US%20Zip%20Codes%20from%202013%20Government%20Data';

const SIMPLEMAPS_URL =
  'https://simplemaps.com/static/data/us-zips/1.94/basic/simplemaps_uszips_basicv1.94.zip';

const OUTPUT_PATH = new URL('../public/data/promap-data.json', import.meta.url)
  .pathname;

interface RawZipRecord {
  z: string;
  lat: number;
  lon: number;
  price: number;
  r: number;
  pop: number;
  n: string;
  s: string;
  m: string;
  p3: number;
  p6: number;
  p1: number;
}

interface Centroid {
  lat: number;
  lng: number;
  population: number;
}

// ── CSV parsing with proper quote handling ──────────────────────────────────

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current);
  return fields;
}

// ── Download helpers ────────────────────────────────────────────────────────

async function downloadText(url: string, label: string): Promise<string> {
  console.log(`⬇ Downloading ${label}...`);
  const start = Date.now();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} for ${label}: ${response.statusText}`,
    );
  }
  const text = await response.text();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const sizeMB = (text.length / 1024 / 1024).toFixed(1);
  console.log(`  ✓ ${label}: ${sizeMB} MB in ${elapsed}s`);
  return text;
}

async function downloadZip(url: string, label: string): Promise<ArrayBuffer> {
  console.log(`⬇ Downloading ${label}...`);
  const start = Date.now();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} for ${label}: ${response.statusText}`,
    );
  }
  const buf = await response.arrayBuffer();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const sizeMB = (buf.byteLength / 1024 / 1024).toFixed(1);
  console.log(`  ✓ ${label}: ${sizeMB} MB in ${elapsed}s`);
  return buf;
}

// ── Parse SimpleMaps population data ─────────────────────────────────────────

async function parseSimpleMapsPopulation(
  zipBuf: ArrayBuffer,
): Promise<Map<string, number>> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(zipBuf);

  // Find the CSV file inside the archive
  const csvFile = Object.keys(zip.files).find((f) => f.endsWith('.csv'));
  if (!csvFile) throw new Error('No CSV found in SimpleMaps ZIP archive');

  const text = await zip.files[csvFile].async('text');
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('SimpleMaps CSV has no data');

  const header = parseCSVLine(lines[0]);
  const zipIdx = header.indexOf('zip');
  const popIdx = header.indexOf('population');

  if (zipIdx === -1 || popIdx === -1) {
    throw new Error(
      `SimpleMaps CSV missing columns. Found: ${header.slice(0, 10).join(', ')}`,
    );
  }

  const popMap = new Map<string, number>();
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i].trim());
    if (!fields[zipIdx]) continue;

    const zipCode = fields[zipIdx].padStart(5, '0');
    const pop = Number.parseInt(fields[popIdx], 10);
    if (!Number.isNaN(pop) && pop > 0) {
      popMap.set(zipCode, pop);
    }
  }

  console.log(`  ✓ Parsed population for ${popMap.size.toLocaleString()} ZIPs`);
  return popMap;
}

// ── Parse Census centroids ──────────────────────────────────────────────────

function parseCentroids(text: string): Map<string, Centroid> {
  const map = new Map<string, Centroid>();
  const lines = text.trim().split('\n');

  // Skip header: ZIP,LAT,LNG
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 3) continue;

    const zip = parts[0].trim();
    const lat = Number.parseFloat(parts[1]);
    const lng = Number.parseFloat(parts[2]);

    if (zip && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      map.set(zip, { lat, lng, population: 0 });
    }
  }

  console.log(`  ✓ Parsed ${map.size.toLocaleString()} centroids`);
  return map;
}

// ── Parse ZHVI CSV and join with centroids ──────────────────────────────────

function parseZHVI(
  text: string,
  centroids: Map<string, Centroid>,
  popMap: Map<string, number>,
): RawZipRecord[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('ZHVI CSV has no data rows');

  const header = parseCSVLine(lines[0]);

  // Find column indices
  const colIdx = {
    regionName: header.indexOf('RegionName'),
    sizeRank: header.indexOf('SizeRank'),
    state: header.indexOf('State'),
    city: header.indexOf('City'),
    metro: header.indexOf('Metro'),
  };

  // Find monthly value columns (format: YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const dateColumns: { index: number; date: string }[] = [];
  for (let i = 0; i < header.length; i++) {
    if (dateRegex.test(header[i])) {
      dateColumns.push({ index: i, date: header[i] });
    }
  }

  // Sort by date descending (newest first)
  dateColumns.sort((a, b) => b.date.localeCompare(a.date));

  console.log(
    `  ✓ ZHVI: ${lines.length - 1} rows, ${dateColumns.length} monthly columns`,
  );
  console.log(
    `  ✓ Date range: ${dateColumns[dateColumns.length - 1].date} → ${dateColumns[0].date}`,
  );

  const records: RawZipRecord[] = [];
  let skippedNoCoords = 0;
  let skippedNoPrice = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);

    const zip = (fields[colIdx.regionName] || '').padStart(5, '0');
    const centroid = centroids.get(zip);

    if (!centroid) {
      skippedNoCoords++;
      continue;
    }

    // Find latest non-empty price
    let latestPrice = 0;
    let latestIdx = -1;
    for (let j = 0; j < dateColumns.length; j++) {
      const val = Number.parseFloat(fields[dateColumns[j].index]);
      if (!Number.isNaN(val) && val > 0) {
        latestPrice = Math.round(val);
        latestIdx = j;
        break;
      }
    }

    if (latestPrice === 0) {
      skippedNoPrice++;
      continue;
    }

    // Helper to get price at N months ago from the latest available
    function getPriceNMonthsAgo(n: number): number {
      // dateColumns is sorted newest first, so N months ago is approximately index latestIdx + n
      const targetIdx = latestIdx + n;
      if (targetIdx >= dateColumns.length) return 0;
      const val = Number.parseFloat(fields[dateColumns[targetIdx].index]);
      return !Number.isNaN(val) && val > 0 ? val : 0;
    }

    // Price changes
    const price3m = getPriceNMonthsAgo(3);
    const price6m = getPriceNMonthsAgo(6);
    const price1y = getPriceNMonthsAgo(12);

    const p3 =
      price3m > 0 ? Math.round(((latestPrice - price3m) / price3m) * 100) : 0;
    const p6 =
      price6m > 0 ? Math.round(((latestPrice - price6m) / price6m) * 100) : 0;
    const p1 =
      price1y > 0 ? Math.round(((latestPrice - price1y) / price1y) * 100) : 0;

    const sizeRank = Number.parseInt(fields[colIdx.sizeRank] || '0', 10) || 0;
    const city = fields[colIdx.city] || '';
    const state = fields[colIdx.state] || '';
    const metro = fields[colIdx.metro] || '';

    const pop = popMap.get(zip) ?? 0;

    records.push({
      z: zip,
      lat: Math.round(centroid.lat * 1000) / 1000,
      lon: Math.round(centroid.lng * 1000) / 1000,
      price: latestPrice,
      r: sizeRank,
      pop,
      n: city,
      s: state,
      m: metro,
      p3,
      p6,
      p1,
    });
  }

  const withPop = records.filter((r) => r.pop > 0).length;
  console.log(`  ✓ Matched: ${records.length.toLocaleString()} records`);
  console.log(
    `  ✓ With population: ${withPop.toLocaleString()} (${((withPop / records.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  ⊘ Skipped (no coordinates): ${skippedNoCoords.toLocaleString()}`,
  );
  console.log(
    `  ⊘ Skipped (no price data): ${skippedNoPrice.toLocaleString()}`,
  );

  return records;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🏠 ProMap Data Preparation\n');

  const [zhviText, centroidsText, simpleMapsZip] = await Promise.all([
    downloadText(ZHVI_URL, 'Zillow ZHVI CSV'),
    downloadText(CENTROIDS_URL, 'Census ZIP Centroids'),
    downloadZip(SIMPLEMAPS_URL, 'SimpleMaps US Zips (ZIP)'),
  ]);

  console.log('\n📊 Processing...');
  const popMap = await parseSimpleMapsPopulation(simpleMapsZip);
  const centroids = parseCentroids(centroidsText);
  const records = parseZHVI(zhviText, centroids, popMap);

  // Sort by SizeRank for better data locality
  records.sort((a, b) => a.r - b.r);

  console.log('\n💾 Writing output...');
  const json = JSON.stringify(records);
  await Bun.write(OUTPUT_PATH, json);

  const sizeBytes = json.length;
  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
  console.log(`  ✓ Output: ${OUTPUT_PATH}`);
  console.log(`  ✓ Size: ${sizeMB} MB (${sizeBytes.toLocaleString()} bytes)`);
  console.log(`  ✓ Records: ${records.length.toLocaleString()}`);
  console.log('\n✅ Done!');
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
