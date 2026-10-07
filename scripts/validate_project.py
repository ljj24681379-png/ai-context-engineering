"""Validate the static portfolio project without third-party dependencies."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md",
    "app/index.html",
    "app/styles.css",
    "app/app.js",
    "data/operating_snapshot.json",
    "docs/metric-definitions.md",
    "docs/business-context.md",
    "rules/analysis-rules.md",
    "queries/region_sales.sql",
]


def main() -> None:
    missing = [path for path in REQUIRED if not (ROOT / path).is_file()]
    if missing:
        raise SystemExit(f"Missing required files: {', '.join(missing)}")

    data = json.loads((ROOT / "data/operating_snapshot.json").read_text(encoding="utf-8"))
    total = data["north_china"]
    expected_rate = (total["current_sales"] - total["comparison_sales"]) / total["comparison_sales"]
    assert round(expected_rate, 4) == total["change_rate"], "North China change rate is inconsistent"
    assert sum(city["comparison_sales"] for city in data["cities"]) == total["comparison_sales"]
    assert sum(city["current_sales"] for city in data["cities"]) == total["current_sales"]
    assert round(sum(city["decline_contribution"] for city in data["cities"]), 4) == 1.0

    html = (ROOT / "app/index.html").read_text(encoding="utf-8")
    for marker in ("stepList", "replayButton", "evidenceDetail"):
        assert f'id="{marker}"' in html, f"Missing interactive marker: {marker}"

    print("PASS: files, data calculations, and interactive markers are valid")


if __name__ == "__main__":
    main()
