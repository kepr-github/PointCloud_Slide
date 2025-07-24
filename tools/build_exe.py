#!/usr/bin/env python3
"""Build serve.py into a standalone executable using PyInstaller."""

from __future__ import annotations

import subprocess
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    serve_py = root / "serve.py"
    subprocess.check_call([
        "pyinstaller",
        "--onefile",
        "--clean",
        str(serve_py),
    ])


if __name__ == "__main__":
    main()
