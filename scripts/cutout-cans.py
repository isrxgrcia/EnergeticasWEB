"""Recorta las latas Jeta TNT de las imágenes originales (1254×1254) con una
silueta de lata común (todas usan la misma plantilla y encuadre) y exporta
WebP con transparencia.

Uso: python3 scripts/cutout-cans.py <carpeta_originales> <carpeta_salida>
Los nombres de entrada se indican en SOURCES.
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SOURCES = {
    'jeta-tnt-citrus-shock': 'citrus-shock.png',
    'jeta-tnt-blue-voltage': 'blue-voltage.png',
    'jeta-tnt-original-blast': 'original-blast.png',
    'jeta-tnt-cherry-nitro': 'cherry-nitro.png',
    'jeta-tnt-tropical-detonator': 'tropical-detonator.png',
    'jeta-tnt-zero-ice': 'zero-ice.png',
}

SS = 4  # supermuestreo para bordes suaves
CROP = (386, 24, 854, 1178)  # caja de la lata en la imagen original


def ellipse_arc(cx, cy, rx, ry, a0, a1, steps=48):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / steps)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / steps))) for i in range(steps + 1)]


def can_outline():
    """Silueta medida sobre la plantilla (coordenadas de la imagen original)."""
    top = ellipse_arc(620.5, 62, 188.5, 31, 180, 360)            # tapa: izquierda → derecha por arriba
    right = [(811, 78), (826, 104), (840, 135), (847, 170), (849, 230),
             (849, 1098), (843, 1116), (828, 1134), (812, 1148)]
    bottom = ellipse_arc(620.5, 1148, 191.5, 24, 0, 180)          # base: derecha → izquierda por abajo
    left = [(412, 1134), (397, 1116), (391, 1098), (391, 230), (393, 170),
            (400, 135), (414, 104), (429, 78)]
    return top + right + bottom + left


def mask(size):
    m = Image.new('L', (size[0] * SS, size[1] * SS), 0)
    ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in can_outline()], fill=255)
    m = m.resize(size, Image.LANCZOS)
    return m.filter(ImageFilter.GaussianBlur(0.6))


def main(src_dir, out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for slug, name in SOURCES.items():
        im = Image.open(Path(src_dir) / name).convert('RGB')
        rgba = im.copy()
        rgba.putalpha(mask(im.size))
        can = rgba.crop(CROP)
        dest = out / f'{slug}.webp'
        can.save(dest, 'WEBP', quality=82, method=6)
        print(f'{dest}: {can.size[0]}×{can.size[1]}, {dest.stat().st_size // 1024} kB')


if __name__ == '__main__':
    main(*sys.argv[1:3])
