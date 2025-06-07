"""Generate a placeholder secrets_example.env from the Settings model."""
from __future__ import annotations

from pathlib import Path

from config import Settings


def generate(file_path: str | Path = "secrets_example.env") -> None:
    fields = Settings.__fields__
    lines = ["# Example secrets file"]
    for name, field in sorted(fields.items()):
        env_name = field.alias
        example = field.field_info.extra.get("example")
        if example is None:
            if field.default is not None:
                example = str(field.default)
            else:
                example = ""
        lines.append(f"{env_name}={example}")

    Path(file_path).write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    generate()
