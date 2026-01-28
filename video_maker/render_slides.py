from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


SYSTEM_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Helvetica.ttf",
]


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in SYSTEM_FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    if not text:
        return []
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width or not current:
            current = test
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def _fit_text_blocks(
    draw: ImageDraw.ImageDraw,
    blocks: list[list[str]],
    fonts: list[ImageFont.ImageFont],
    max_width: int,
    max_height: int,
    line_spacing: int,
) -> tuple[list[list[str]], list[ImageFont.ImageFont]]:
    while True:
        height = 0
        for lines, font in zip(blocks, fonts):
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                height += bbox[3] - bbox[1] + line_spacing
        if height <= max_height:
            return blocks, fonts
        new_fonts: list[ImageFont.ImageFont] = []
        for font in fonts:
            if isinstance(font, ImageFont.FreeTypeFont):
                size = max(10, int(font.size * 0.9))
                new_fonts.append(_load_font(size))
            else:
                new_fonts.append(font)
        fonts = new_fonts
        blocks = [
            _wrap_text(draw, " ".join(lines), font, max_width)
            for lines, font in zip(blocks, fonts)
        ]


def _truncate_text(text: str, limit: int = 200) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 3].rstrip() + "..."


def _draw_lines(
    draw: ImageDraw.ImageDraw,
    lines: Iterable[str],
    font: ImageFont.ImageFont,
    x: int,
    y: int,
    fill: tuple[int, int, int],
    line_spacing: int,
) -> int:
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), line, font=font)
        y += bbox[3] - bbox[1] + line_spacing
    return y


def render_slide(
    slide: dict,
    out_path: Path,
    size: tuple[int, int],
    margin: int,
    theme: str,
    footer: str,
    background_path: Path | None = None,
) -> None:
    width, height = size
    if background_path and background_path.exists():
        background = Image.open(background_path).convert("RGB").resize(size)
    else:
        bg_color = (11, 15, 20) if theme == "dark" else (245, 246, 248)
        background = Image.new("RGB", size, color=bg_color)

    draw = ImageDraw.Draw(background)
    text_color = (238, 241, 246) if theme == "dark" else (25, 27, 30)
    subtitle_color = (180, 185, 194) if theme == "dark" else (70, 72, 75)
    bullet_color = (210, 214, 222) if theme == "dark" else (40, 42, 45)
    footer_color = (120, 125, 132) if theme == "dark" else (90, 92, 95)

    title_font = _load_font(56)
    subtitle_font = _load_font(36)
    bullet_font = _load_font(28)
    footer_font = _load_font(18)

    max_text_width = width - margin * 2

    title_lines = _wrap_text(draw, slide.get("title", ""), title_font, max_text_width)
    subtitle_lines = _wrap_text(draw, slide.get("subtitle", ""), subtitle_font, max_text_width)

    bullets = slide.get("bullets") or []
    bullet_lines: list[str] = []
    if bullets:
        for bullet in bullets:
            wrapped = _wrap_text(draw, bullet, bullet_font, max_text_width - 20)
            for idx, line in enumerate(wrapped):
                prefix = "• " if idx == 0 else "  "
                bullet_lines.append(f"{prefix}{line}")
    else:
        excerpt = _truncate_text(slide.get("voice", ""), 200)
        bullet_lines = _wrap_text(draw, excerpt, bullet_font, max_text_width)

    blocks = [title_lines, subtitle_lines, bullet_lines]
    fonts = [title_font, subtitle_font, bullet_font]
    blocks, fonts = _fit_text_blocks(
        draw,
        blocks,
        fonts,
        max_width=max_text_width,
        max_height=height - margin * 2 - 40,
        line_spacing=12,
    )

    y = margin
    y = _draw_lines(draw, blocks[0], fonts[0], margin, y, text_color, 12)
    if blocks[1]:
        y += 6
        y = _draw_lines(draw, blocks[1], fonts[1], margin, y, subtitle_color, 10)
    if blocks[2]:
        y += 10
        y = _draw_lines(draw, blocks[2], fonts[2], margin, y, bullet_color, 8)

    footer_bbox = draw.textbbox((0, 0), footer, font=footer_font)
    footer_x = margin
    footer_y = height - margin - (footer_bbox[3] - footer_bbox[1])
    draw.text((footer_x, footer_y), footer, font=footer_font, fill=footer_color)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    background.save(out_path)
