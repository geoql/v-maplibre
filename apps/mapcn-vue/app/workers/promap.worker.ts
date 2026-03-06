/**
 * ProMap Web Worker — fetches and transforms raw ZIP data off the main thread.
 *
 * Input: WorkerRequestInit with dataUrl
 * Output: WorkerResponseProgress | WorkerResponseData | WorkerResponseError
 */

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

interface ZipDataPoint {
  zip: string;
  coordinates: [number, number];
  population: number;
  price: number;
  priceChange: number;
  city: string;
  state: string;
  metro: string;
}

interface WorkerRequestInit {
  type: 'init';
  dataUrl: string;
}

interface WorkerResponseProgress {
  type: 'progress';
  message: string;
}

interface WorkerResponseData {
  type: 'data';
  points: ZipDataPoint[];
  version: string;
}

interface WorkerResponseError {
  type: 'error';
  message: string;
}

type WorkerResponse =
  | WorkerResponseProgress
  | WorkerResponseData
  | WorkerResponseError;

function postMsg(msg: WorkerResponse): void {
  self.postMessage(msg);
}

/** Transform a raw compact record into a full ZipDataPoint */
function transformRecord(raw: RawZipRecord): ZipDataPoint {
  return {
    zip: raw.z,
    coordinates: [raw.lon, raw.lat],
    population: raw.pop,
    price: raw.price,
    priceChange: raw.p1 / 100, // Convert integer percentage to decimal
    city: raw.n,
    state: raw.s,
    metro: raw.m,
  };
}

/** Generate a version hash from the data size and first/last records */
function computeVersion(records: RawZipRecord[]): string {
  if (records.length === 0) return '0';
  const first = records[0];
  const last = records[records.length - 1];
  return `${records.length}-${first.z}-${last.z}-${first.price}`;
}

self.onmessage = async (event: MessageEvent<WorkerRequestInit>) => {
  const { dataUrl } = event.data;

  try {
    postMsg({ type: 'progress', message: 'Fetching data...' });

    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    postMsg({ type: 'progress', message: 'Parsing JSON...' });

    const rawRecords: RawZipRecord[] = await response.json();

    postMsg({
      type: 'progress',
      message: `Transforming ${rawRecords.length.toLocaleString()} records...`,
    });

    const points = rawRecords.map(transformRecord);
    const version = computeVersion(rawRecords);

    postMsg({ type: 'data', points, version });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    postMsg({ type: 'error', message });
  }
};
