from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


class FFmpegMissingError(RuntimeError):
    pass


def ensure_ffmpeg() -> None:
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        raise FFmpegMissingError(
            "ffmpeg/ffprobe not found. Install via 'brew install ffmpeg' on macOS."
        )


def probe_duration(path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]
    result = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return float(result.stdout.strip())


def build_segment(
    image_path: Path,
    audio_path: Path,
    out_path: Path,
    duration: float,
    fps: int,
) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-i",
        str(image_path),
        "-i",
        str(audio_path),
        "-t",
        f"{duration:.2f}",
        "-r",
        str(fps),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-shortest",
        str(out_path),
    ]
    subprocess.run(cmd, check=True)


def write_concat_list(segment_paths: list[Path], list_path: Path) -> None:
    lines = [f"file '{path.as_posix()}'" for path in segment_paths]
    list_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def concat_segments(
    list_path: Path,
    out_path: Path,
    reencode: bool = False,
) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(list_path),
    ]
    if reencode:
        cmd.extend(["-c:v", "libx264", "-c:a", "aac", str(out_path)])
    else:
        cmd.extend(["-c", "copy", str(out_path)])
    subprocess.run(cmd, check=True)
