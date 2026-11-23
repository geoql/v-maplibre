# /// script
# requires-python = ">=3.11"
# dependencies = ["zarr>=3", "fsspec", "aiohttp", "requests", "pandas", "pyarrow", "numpy", "numcodecs"]
# ///
"""Builds public/data/grrr/basins.json for the GRRR streamflow example.

Source: Google Runoff Reanalysis & Reforecast (GRRR), November 2026 version,
CC BY 4.0. The dataset covers about 970K HydroBASINS sub-basins. The example
map shows only the large rivers: basins whose 2-year return period is at least
MIN_RP2 m3/s.

For each basin the file stores:
- id:  the number in "subhybas_<id>"
- row: the row of the basin in reanalysis/streamflow.zarr (the API reads it)
- lon, lat: the outlet point (Lehner, "UNOFFICIAL" in the dataset name)
- rp2, rp5, rp20, rp100: return-period discharge in m3/s

Run from the repository root:
    uv run apps/mapcn-vue/scripts/grrr/build-basins.py
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import zarr

BASE = (
    "https://storage.googleapis.com/flood-forecasting/"
    "hydrologic_predictions/distributed_model_2026_11/"
)
MIN_RP2 = 1500.0
OUT = Path(__file__).resolve().parents[2] / "public/data/grrr/basins.json"


def main() -> None:
    return_periods = pd.read_parquet(BASE + "return_periods.parquet")

    outlets = zarr.open_group(
        BASE + "subhybas_outlet_locations_UNOFFICIAL.zarr/", mode="r"
    )
    locations = pd.DataFrame(
        {
            "lat": outlets["latitude"][:],
            "lon": outlets["longitude"][:],
        },
        index=pd.Index(outlets["gauge_id"][:], name="gauge_id"),
    )

    streamflow = zarr.open_group(BASE + "reanalysis/streamflow.zarr/", mode="r")
    gauge_ids = streamflow["gauge_id"][:]
    rows = pd.DataFrame(
        {"row": np.arange(len(gauge_ids))},
        index=pd.Index(gauge_ids, name="gauge_id"),
    )

    basins = (
        return_periods[return_periods[2.0] >= MIN_RP2]
        .join(locations, how="inner")
        .join(rows, how="inner")
        .dropna(subset=["lat", "lon"])
        .sort_values(2.0)
    )

    data = {
        "source": "GRRR distributed_model_2026_11 (CC BY 4.0)",
        "minRp2": MIN_RP2,
        "count": len(basins),
        "id": [int(g.removeprefix("subhybas_")) for g in basins.index],
        "row": basins["row"].astype(int).tolist(),
        "lon": basins["lon"].round(3).tolist(),
        "lat": basins["lat"].round(3).tolist(),
        "rp2": basins[2.0].round().astype(int).tolist(),
        "rp5": basins[5.0].round().astype(int).tolist(),
        "rp20": basins[20.0].round().astype(int).tolist(),
        "rp100": basins[100.0].round().astype(int).tolist(),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":")))
    print(f"wrote {len(basins)} basins to {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
