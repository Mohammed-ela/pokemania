from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ICON = os.path.join(HERE, "..", "assets", "icon.png")
F = "C:/Windows/Fonts/"
W, H = 1024, 500

# Fond : dégradé rouge diagonal
bg = Image.new("RGB", (W, H))
px = bg.load()
c1, c2 = (239, 68, 68), (127, 17, 17)
for y in range(H):
    for x in range(W):
        t = min(1, max(0, (x * 0.7 + y * 0.6) / (W * 0.7 + H * 0.6)))
        px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

# Grande pokéball décorative en filigrane
icon = Image.open(ICON).convert("RGBA")
ghost = icon.resize((620, 620), Image.LANCZOS)
alpha = ghost.split()[3].point(lambda a: int(a * 0.10))
white = Image.new("RGBA", ghost.size, (255, 255, 255, 0)); white.putalpha(alpha)
bg.paste(white, (-170, -60), white)

# Icône principale avec ombre
size = 260
ic = icon.resize((size, size), Image.LANCZOS)
ix, iy = W - size - 60, (H - size) // 2
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.ellipse((ix + 8, iy + 16, ix + size + 8, iy + size + 16), fill=(0, 0, 0, 110))
shadow = shadow.filter(ImageFilter.GaussianBlur(14))
bg.paste(shadow, (0, 0), shadow)
bg.paste(ic, (ix, iy), ic)

d = ImageDraw.Draw(bg)
title = ImageFont.truetype(F + "seguibl.ttf", 96)
sub = ImageFont.truetype(F + "segoeuib.ttf", 29)
chip = ImageFont.truetype(F + "seguisb.ttf", 20)

x0 = 80
d.text((x0 + 3, 118 + 4), "Pokemania", font=title, fill=(90, 10, 10))
d.text((x0, 118), "Pokemania", font=title, fill="white")
d.text((x0 + 4, 240), "Le Pokédex complet des 1025 Pokémon", font=sub, fill=(255, 228, 228))

chips = ["Stats & évolutions", "Shiny & Gigamax", "Hors-ligne"]
cx, cy = x0, 310
for label in chips:
    w = d.textlength(label, font=chip)
    d.rounded_rectangle((cx, cy, cx + w + 36, cy + 46), radius=23, fill=(255, 255, 255))
    d.text((cx + 18, cy + 9), label, font=chip, fill=(185, 28, 28))
    cx += w + 36 + 10

bg.save(os.path.join(HERE, "image-presentation-1024x500.png"), optimize=True)
icon.resize((512, 512), Image.LANCZOS).save(os.path.join(HERE, "icone-512x512.png"), optimize=True)
print("ok")
