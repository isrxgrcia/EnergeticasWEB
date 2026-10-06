/** Contraste WCAG 2.x entre dos colores hex #RRGGBB. */
function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export const THEME = {
  bg: '#121214',
  surface: '#1C1C20',
  text: '#F3EEE3',
} as const;

const HEX = /^#[0-9a-f]{6}$/i;

export interface AccentTokens {
  /** Color decorativo (halos, motivos). */
  accent: string;
  /** Color de acento apto para texto sobre fondo y superficie (≥ 4.5:1) o texto base. */
  accentText: string;
  /** Texto legible sobre un relleno de acento. */
  accentOn: string;
}

/** Regla §4.1: el color del producto solo se usa en texto si supera 4.5:1. */
export function accentTokens(color: string): AccentTokens {
  const accent = HEX.test(color) ? color : THEME.text;
  const readable =
    contrastRatio(accent, THEME.bg) >= 4.5 && contrastRatio(accent, THEME.surface) >= 4.5;
  const accentOn =
    contrastRatio(THEME.bg, accent) >= contrastRatio(THEME.text, accent) ? THEME.bg : THEME.text;
  return { accent, accentText: readable ? accent : THEME.text, accentOn };
}
