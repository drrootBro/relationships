import asyncio
import platform
import subprocess
from pathlib import Path
from typing import Optional


def _run_command(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _edge_tts_available() -> bool:
    try:
        import edge_tts  # noqa: F401
    except Exception:
        return False
    return True


def _render_with_edge_tts(text: str, out_path: Path, voice: str, rate: str) -> None:
    import edge_tts

    async def _run() -> None:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await communicate.save(str(out_path))

    asyncio.run(_run())


def _render_with_say(text: str, out_path: Path, voice: Optional[str]) -> None:
    if platform.system() != "Darwin":
        raise RuntimeError("macOS 'say' fallback is only available on macOS.")
    temp_aiff = out_path.with_suffix(".aiff")
    cmd = ["say", "-o", str(temp_aiff)]
    if voice:
        cmd.extend(["-v", voice])
    cmd.append(text)
    _run_command(cmd)
    _run_command([
        "ffmpeg",
        "-y",
        "-i",
        str(temp_aiff),
        "-codec:a",
        "libmp3lame",
        "-q:a",
        "2",
        str(out_path),
    ])
    temp_aiff.unlink(missing_ok=True)


def generate_tts(text: str, out_path: Path, voice: str, rate: str) -> None:
    _ensure_parent(out_path)
    if _edge_tts_available():
        _render_with_edge_tts(text, out_path, voice, rate)
        return
    _render_with_say(text, out_path, voice if voice else None)
