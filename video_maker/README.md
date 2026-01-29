# Video Maker (MVP)

Generate an MP4 video from a slide script JSON using local-first tooling (Pillow + ffmpeg + TTS).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r video_maker/requirements.txt
```

## Run

```bash
python -m video_maker.main \
  --script video_maker/sample/script.json \
  --out output.mp4 \
  --size 1280x720 \
  --bg video_maker/sample/background.png
```

### Visual mode

Provide ordered images + notes. Narration is generated from notes and can be edited by
writing the visual script to disk.

```bash
python -m video_maker.main \
  --mode visual2video \
  --images video_maker/sample/slide1.png video_maker/sample/slide2.png \
  --notes "Intro note" "Second note" \
  --save-visual-script visual_script.json \
  --out output.mp4
```

Edit `visual_script.json` as needed, then render using:

```bash
python -m video_maker.main \
  --mode visual2video \
  --visual-script visual_script.json \
  --out output.mp4
```

### Options

- `--mode text|visual2video` (default text)
- `--voice "en-US-GuyNeural"` (default)
- `--rate "+0%"` (default)
- `--margin 80`
- `--fps 30`
- `--theme dark|light` (default dark)
- `--keep-temp` (keep temp files)

## How it works

1. Renders each slide to `slide_###.png` using Pillow.
2. Generates per-slide TTS audio (`slide_###.mp3`).
3. Measures audio duration with `ffprobe` and pads by 0.2s.
4. Builds slide segments (`segment_###.mp4`) and concatenates them.

Each slide duration is strictly driven by its audio duration, maintaining a 1:1 mapping between slide N and audio N.

## Troubleshooting

### `edge-tts` missing

If `edge-tts` is not available, the tool falls back to macOS `say`. Ensure `ffmpeg` is installed so the `.aiff` output can be converted to `.mp3`.

### `ffmpeg` missing

Install ffmpeg via Homebrew:

```bash
brew install ffmpeg
```

## Customization

- **Voice**: pick another Edge voice (e.g. `en-US-JennyNeural`) using `--voice`.
- **Theme**: use `--theme light` for light backgrounds.
- **Background**: pass `--bg path/to/image.png` for a branded backdrop.
- **Footer**: use `--footer "Your footer"`.
