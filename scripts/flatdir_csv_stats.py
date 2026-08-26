import csv
from pathlib import Path


def rows(path: Path, root: Path) -> int | None:
    if path.is_dir() or path.suffix.lower() != ".csv":
        return None

    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.reader(file)
        try:
            next(reader)
        except StopIteration:
            return 0

        return sum(1 for _ in reader)


def columns(path: Path, root: Path) -> int | None:
    if path.is_dir() or path.suffix.lower() != ".csv":
        return None

    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.reader(file)
        try:
            header = next(reader)
        except StopIteration:
            return 0

    return len(header)
