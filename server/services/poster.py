from PIL import Image, ImageDraw, ImageFont
import qrcode, os

# poster size (Instagram story ratio-ish)
W, H = 1080, 1350

# load fonts with fallback
try:
    FONT = ImageFont.truetype("DejaVuSans.ttf", 72)
    SMALL_FONT = ImageFont.truetype("DejaVuSans.ttf", 36)
except Exception:
    FONT = ImageFont.load_default()
    SMALL_FONT = ImageFont.load_default()


def draw_poster(
    artist: str,
    city: str,
    date_str: str,
    palette: list[str],
    tracks: list[str],
    qr_url: str,
    out_path: str,
):
    """Generate and save a concert poster PNG."""
    # background
    img = Image.new("RGB", (W, H), palette[0] if palette else "white")
    draw = ImageDraw.Draw(img)

    # palette bands
    if palette:
        band_h = H // len(palette)
        for i, col in enumerate(palette):
            draw.rectangle([(0, i * band_h), (W, (i + 1) * band_h)], fill=col)

    # border
    draw.rectangle([(0, 0), (W - 1, H - 1)], outline="#000000", width=6)

    # text block
    margin = 64
    draw.text((margin, margin), artist, font=FONT, fill="#111")
    draw.text((margin, margin + 100), city, font=SMALL_FONT, fill="#111")
    draw.text((margin, margin + 160), date_str, font=SMALL_FONT, fill="#111")

    # tracklist
    y = 400
    for t in tracks[:8]:  # max 8 tracks
        draw.text((margin, y), f"• {t}", font=SMALL_FONT, fill="white")
        y += 50

    # QR code
    qr = qrcode.make(qr_url)
    qr_size = 260
    qr = qr.resize((qr_size, qr_size))
    img.paste(qr, (W - qr_size - margin, H - qr_size - margin))

    # save
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="PNG")
    return out_path
