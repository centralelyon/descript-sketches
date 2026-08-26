#!/usr/bin/env bash
set -euo pipefail

python3 -m flatdir assets/tempData/datasets \
  --only type=file \
  --match '.*\.csv$' \
  --fields scripts/flatdir_csv_stats.py \
  --sort name \
  --output assets/tempData/datasets/datasets.json
