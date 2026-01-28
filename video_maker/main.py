import argparse
import json
import shutil
import sys
import tempfile
from pathlib import Path

from video_maker.ffmpeg_concat import (
    FFmpegMissingError,
    build_segment,
    concat_segments,
    ensure_ffmpeg,
    probe_duration,
    write_concat_list,
)
from video_maker.render_slides import render_slide
from video_maker.tts import generate_tts

DEFAULT_FOOTER = "Dr. RootBro — Clinical Audit Series"


def parse_size(value: str) -> tuple[int, int]:
    if "x" not in value:
        raise argparse.ArgumentTypeError("Size must be WIDTHxHEIGHT, e.g. 1280x720")
    width, height = value.lower().split("x", 1)
    return int(width), int(height)


def load_script(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Script JSON must be an array of slides")
    return data


def ensure_out_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def build_video(args: argparse.Namespace) -> None:
    ensure_ffmpeg()
    script_path = Path(args.script)
    slides = load_script(script_path)
    background = Path(args.bg) if args.bg else None

    temp_dir = Path(tempfile.mkdtemp(prefix="video_maker_"))
    segment_paths: list[Path] = []
    try:
        for index, slide in enumerate(slides, start=1):
            number = f"{index:03d}"
            slide_image = temp_dir / f"slide_{number}.png"
            slide_audio = temp_dir / f"slide_{number}.mp3"
            slide_segment = temp_dir / f"segment_{number}.mp4"

            render_slide(
                slide,
                slide_image,
                size=args.size,
                margin=args.margin,
                theme=args.theme,
                footer=args.footer,
                background_path=background,
            )

            voice_text = slide.get("voice")
            if not voice_text:
                raise ValueError(f"Slide {slide.get('slide', index)} is missing 'voice' text")
            generate_tts(voice_text, slide_audio, voice=args.voice, rate=args.rate)

            duration = probe_duration(slide_audio) + 0.2
            build_segment(slide_image, slide_audio, slide_segment, duration, args.fps)
            segment_paths.append(slide_segment)

        concat_list = temp_dir / "concat_list.txt"
        write_concat_list(segment_paths, concat_list)
        out_path = Path(args.out)
        ensure_out_dir(out_path)

        try:
            concat_segments(concat_list, out_path, reencode=False)
        except Exception:
            concat_segments(concat_list, out_path, reencode=True)
    finally:
        if args.keep_temp:
            print(f"Temp files preserved at: {temp_dir}")
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate an MP4 video from slide JSON.")
    parser.add_argument("--script", required=True, help="Path to slide JSON script")
    parser.add_argument("--out", required=True, help="Output MP4 path")
    parser.add_argument("--size", type=parse_size, default=(1280, 720), help="WIDTHxHEIGHT")
    parser.add_argument("--bg", help="Optional background image path")
    parser.add_argument("--voice", default="en-US-GuyNeural", help="TTS voice name")
    parser.add_argument("--rate", default="+0%", help="TTS rate")
    parser.add_argument("--margin", type=int, default=80, help="Slide margin in px")
    parser.add_argument("--fps", type=int, default=30, help="Frames per second")
    parser.add_argument("--theme", choices=["dark", "light"], default="dark")
    parser.add_argument("--footer", default=DEFAULT_FOOTER, help="Footer text")
    parser.add_argument("--keep-temp", action="store_true", help="Keep temp files")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        build_video(args)
    except FFmpegMissingError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
