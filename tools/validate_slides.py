#!/usr/bin/env python3
"""Validate slides YAML against the JSON schema."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import yaml
from jsonschema import Draft7Validator


def validate(yaml_path: Path, schema_path: Path) -> bool:
    data = yaml.safe_load(yaml_path.read_text())
    schema = json.loads(schema_path.read_text())
    validator = Draft7Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    if errors:
        for error in errors:
            location = ".".join(map(str, error.path))
            print(f"{location}: {error.message}")
        return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate slides.yaml")
    parser.add_argument("file", nargs="?", default="slides.yaml", help="YAML file to validate")
    parser.add_argument("--schema", default="slides.schema.json", help="Path to JSON schema")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    yaml_path = (root / args.file).resolve()
    schema_path = (root / args.schema).resolve()

    ok = validate(yaml_path, schema_path)
    if ok:
        print(f"{yaml_path} is valid")
        return 0
    else:
        print(f"Validation failed for {yaml_path}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
