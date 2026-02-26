#!/usr/bin/env python3
"""Repo-local launcher for the image generation skill CLI.

This wrapper keeps project commands stable (`python scripts/image_gen.py ...`)
while delegating implementation to the bundled skill script.
"""

from __future__ import annotations

import runpy
import sys
from pathlib import Path


def _resolve_target() -> Path:
    repo_root = Path(__file__).resolve().parents[1]
    local_skill_script = (
        repo_root / ".agents" / "skills" / "imagegen" / "scripts" / "image_gen.py"
    )
    if local_skill_script.exists():
        return local_skill_script

    codex_home = Path.home() / ".codex" / "skills" / "imagegen" / "scripts" / "image_gen.py"
    if codex_home.exists():
        return codex_home

    raise SystemExit(
        "Error: Could not find image_gen skill script.\n"
        "Expected one of:\n"
        f"  - {local_skill_script}\n"
        f"  - {codex_home}"
    )


def main() -> int:
    target = _resolve_target()
    # Preserve expected argv semantics for argparse inside the target script.
    sys.argv[0] = str(target)
    runpy.run_path(str(target), run_name="__main__")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
