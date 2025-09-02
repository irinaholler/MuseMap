# server/services/poster.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode, os, math

# ---------- helpers ----------
def _font(size, weight="regular"):
    """Load DejaVuSans; fall back to default."""
    try:
        # you can swap to a nicer font if you ship the .ttf (e.g., Poppins-SemiBold.ttf)
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except Exception:
        return ImageFont.load_default()

def _text_w(draw, text, font):
    return draw.textlength(text, font=font)

def _draw_centered(draw, text, cx, y, font, fill="#fff"):
    w = _text_w(draw, text, font)
    draw.text((cx - w/2, y), text, font=font, fill=fill)

def _clamp(n, a, b): return max(a, min(b, n))


def draw_poster(
    artist: str,
    city: str,
    date_str: str,
    palette: list[str],
    tracks: list[str],
    qr_url: str,
    out_path: str,
    *,
    width: int = 640,            # flyer-ish, denser than 1080x1350
    height: int = 960,
    scale: float = 1.0,          # export scale (e.g., 1.25 for retina)
    theme: str = "dark",         # "dark" | "light"
):
    """
    Generates a shareable concert flyer:
    - Large centered artist name
    - City • Date as subtitle
    - Soft gradient background from palette
    - Rounded inner card + shadow
    - Optional track list (compact)
    - QR at the bottom
    """
    # --- sizes & palette ---
    W, H = int(width*scale), int(height*scale)
    pad = int(36*scale)              # outer padding for the inner card
    r   = int(26*scale)              # card corner radius
    pal = (palette or ["#12131b", "#2a2f3b", "#5c6a7c", "#e3e9ef", "#d81e45"])[:5]

    fg_primary   = "#ffffff" if theme == "dark" else "#0e0f12"
    fg_secondary = "#cfd6e1" if theme == "dark" else "#45505c"

    # --- gradient background ---
    bg = Image.new("RGB", (W, H), pal[0])
    grad = Image.new("RGB", (W, H), pal[-1])
    # vertical gradient blend
    for y in range(H):
        t = y / (H-1)
        # ease
        t = t*t*(3 - 2*t)
        r0, g0, b0 = Image.new("RGB", (1,1), pal[0]).getpixel((0,0))
        r1, g1, b1 = Image.new("RGB", (1,1), pal[2]).getpixel((0,0))
        r_ = int(r0*(1-t) + r1*t); g_ = int(g0*(1-t) + g1*t); b_ = int(b0*(1-t) + b1*t)
        for x in range(W):
            bg.putpixel((x,y), (r_, g_, b_))
    bg = bg.filter(ImageFilter.GaussianBlur(radius=int(18*scale)))

    # --- inner card with shadow ---
    canvas = Image.new("RGBA", (W, H))
    shadow = Image.new("RGBA", (W, H), (0,0,0,0))
    ImageDraw.Draw(shadow).rounded_rectangle((pad+6, pad+8, W-pad+6, H-pad+8), r, fill=(0,0,0,140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(16*scale)))
    canvas = Image.alpha_composite(bg.convert("RGBA"), shadow)

    card = Image.new("RGBA", (W - 2*pad, H - 2*pad), (255,255,255, 18 if theme=="dark" else 245))
    mask = Image.new("L", card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,card.size[0],card.size[1]), r, fill=255)
    sheet = Image.new("RGBA", (W, H), (0,0,0,0))
    sheet.paste(card, (pad, pad), mask)
    img = Image.alpha_composite(canvas, sheet).convert("RGB")
    d = ImageDraw.Draw(img)

    # --- header strip (subtle) ---
    header_h = int(220*scale)
    ImageDraw.Draw(img).rounded_rectangle(
        (pad, pad, W-pad, pad+header_h),
        r, fill=pal[1]
    )

    # --- typography ---
    # responsive title size
    max_title = int(96*scale)
    min_title = int(44*scale)
    TITLE = _font(max_title)
    # shrink title until it fits with side margins
    max_text_w = W - 2*pad - int(48*scale)
    while d.textlength(artist, font=TITLE) > max_text_w and TITLE.size > min_title:
        TITLE = _font(TITLE.size - 2)

    SUB   = _font(int(26*scale))
    LIST  = _font(int(22*scale))

    # --- centered title & subtitle ---
    cx = W/2
    title_y = pad + int(52*scale)
    _draw_centered(d, artist, cx, title_y, TITLE, fill=fg_primary)
    _draw_centered(d, f"{city} • {date_str}", cx, title_y + TITLE.size + int(8*scale), SUB, fill=fg_secondary)

    # --- decorative bands (3) under header ---
    y0 = pad + header_h + int(10*scale)
    band_h = int((H - pad - y0 - 200*scale) / 3)
    for i, col in enumerate(pal[2:5]):
        d.rectangle((pad, y0 + i*band_h, W - pad, y0 + (i+1)*band_h), fill=col)

    # add a small palette strip above the QR (nice meaning cue)
    strip_h = int(14*scale)
    sx0, sy0 = pad + int(20*scale), H - pad - strip_h - int(90*scale)
    sw = int((W - 2*pad - int(40*scale)) / max(1, len(pal)))
    for i, col in enumerate(pal):
        d.rectangle((sx0 + i*sw, sy0, sx0 + (i+1)*sw - 2, sy0 + strip_h), fill=col)

    # --- tracks (compact, left aligned) ---
    tx = pad + int(28*scale)
    ty = y0 + int(16*scale)
    for t in (tracks or [])[:7]:
        d.text((tx, ty), f"• {t}", font=LIST, fill="#ffffff")
        ty += int(30*scale)

    # --- QR bottom-right ---
    qr_size = int(140*scale)
    qr_img = qrcode.make(qr_url).resize((qr_size, qr_size))
    img.paste(qr_img, (W - pad - qr_size - int(8*scale), H - pad - qr_size - int(8*scale)))

    # --- thin card border ---
    d.rounded_rectangle((pad, pad, W - pad, H - pad), r, outline="#0e0f12", width=int(3*scale))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path
