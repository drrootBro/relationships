from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from video_maker.ffmpeg_concat import build_segment, concat_segments, ensure_ffmpeg, probe_duration, write_concat_list
from video_maker.render_slides import render_slide
from video_maker.tts import generate_tts
from video_maker.visual_mode.script import (
    build_visual_script,
    load_visual_script,
    validate_visual_script,
    write_visual_script,
)


def _load_visual_slides(args) -> list[dict]:
    if args.visual_script:
        script_path = Path(args.visual_script)
        slides = load_visual_script(script_path)
    else:
        if not args.images:
            raise ValueError("Visual mode requires --images when no --visual-script is provided.")
        if not args.notes:
            raise ValueError("Visual mode requires --notes when no --visual-script is provided.")
        image_paths = [Path(path) for path in args.images]
        slides = build_visual_script(image_paths, args.notes)
        if args.save_visual_script:
            write_visual_script(slides, Path(args.save_visual_script))
    validate_visual_script(slides)
    return slides


def build_visual_video(args) -> None:
    ensure_ffmpeg()
    slides = _load_visual_slides(args)

    temp_dir = Path(tempfile.mkdtemp(prefix="video_maker_visual_"))
    segment_paths: list[Path] = []
    try:
        for index, slide in enumerate(slides, start=1):
            number = f"{index:03d}"
            slide_image = temp_dir / f"slide_{number}.png"
            slide_audio = temp_dir / f"slide_{number}.mp3"
            slide_segment = temp_dir / f"segment_{number}.mp4"

            background_path = Path(slide["image"])
            render_slide(
                {
                    "title": "",
                    "subtitle": "",
                    "bullets": [],
                },
                slide_image,
                size=args.size,
                margin=args.margin,
                theme=args.theme,
                footer=args.footer,
                background_path=background_path,
            )

            narration = slide.get("narration")
            generate_tts(narration, slide_audio, voice=args.voice, rate=args.rate)

            duration = probe_duration(slide_audio) + 0.2
            build_segment(slide_image, slide_audio, slide_segment, duration, args.fps)
            segment_paths.append(slide_segment)

        concat_list = temp_dir / "concat_list.txt"
        write_concat_list(segment_paths, concat_list)
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            concat_segments(concat_list, out_path, reencode=False)
        except Exception:
            concat_segments(concat_list, out_path, reencode=True)
    finally:
        if args.keep_temp:
            print(f"Temp files preserved at: {temp_dir}")
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)
