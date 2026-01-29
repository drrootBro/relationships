from __future__ import annotations

import json
from pathlib import Path


def note_to_narration(note: str) -> str:
    trimmed = note.strip()
    if not trimmed:
        return ""
    if trimmed.endswith((".", "!", "?")):
        return trimmed
    return f"{trimmed}."


def build_visual_script(image_paths: list[Path], notes: list[str]) -> list[dict]:
    if len(image_paths) != len(notes):
        raise ValueError(
            "Number of images must match number of notes. "
            f"Got {len(image_paths)} images and {len(notes)} notes."
        )
    slides: list[dict] = []
    for index, (image_path, note) in enumerate(zip(image_paths, notes), start=1):
        if not note or not note.strip():
            raise ValueError(f"Slide {index} is missing a note.")
        slides.append(
            {
                "slide": index,
                "image": str(image_path),
                "note": note,
                "narration": note_to_narration(note),
            }
        )
    return slides


def load_visual_script(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Visual script JSON must be an array of slides")
    return data


def validate_visual_script(slides: list[dict]) -> None:
    for index, slide in enumerate(slides, start=1):
        image = slide.get("image")
        note = slide.get("note")
        narration = slide.get("narration")
        if not note or not str(note).strip():
            raise ValueError(f"Slide {index} is missing a note.")
        if not narration or not str(narration).strip():
            raise ValueError(f"Slide {index} is missing narration text.")
        if not image or not str(image).strip():
            raise ValueError(f"Slide {index} is missing an image path.")
        if not Path(str(image)).exists():
            raise ValueError(f"Slide {index} image does not exist: {image}")


def write_visual_script(slides: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(slides, indent=2), encoding="utf-8")
