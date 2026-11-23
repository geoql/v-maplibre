# GRRR Basins Data

- **Source**: Google Runoff Reanalysis & Reforecast (GRRR), November 2026 version
  (`gs://flood-forecasting/hydrologic_predictions/distributed_model_2026_11/`)
- **Notebook**: https://colab.research.google.com/drive/1grin2HB2ov-Bf3_7a7JVfVwgxRNgCU5C
- **Fetched**: 2026-11-23
- **License**: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)

## Files

| File          | Size    | Description                                                                                                       |
| ------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `basins.json` | ~1.7 MB | 31,235 sub-basins with a 2-year return period of at least 1,500 m³/s: id, streamflow row, outlet point, rp2/5/20/100 |

The columns are parallel arrays (`id[i]`, `row[i]`, `lon[i]`, … describe basin `i`).
`row` is the basin's row in `reanalysis/streamflow.zarr`; the `/api/grrr/<row>`
route reads that row from Google Cloud Storage. The outlet points come from the
dataset's `subhybas_outlet_locations_UNOFFICIAL.zarr` and are approximate.

## Regeneration

```bash
uv run apps/mapcn-vue/scripts/grrr/build-basins.py
```

The script has PEP 723 inline dependencies (zarr, pandas, pyarrow). It reads
the public bucket over HTTPS, no credentials needed.
