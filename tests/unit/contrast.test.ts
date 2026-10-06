import { describe, expect, it } from 'vitest';
import { accentTokens, contrastRatio, THEME } from '../../src/domain/contrast';
import { DEMO_CATALOG } from '../../src/data/catalog.demo';

describe('contraste (§4.1)', () => {
  it('coincide con los valores de la especificación', () => {
    expect(contrastRatio(THEME.text, THEME.bg)).toBeCloseTo(16.17, 1);
    expect(contrastRatio('#B04DE0', THEME.bg)).toBeCloseTo(4.44, 1);
  });

  it('un acento con contraste insuficiente no se usa como texto', () => {
    expect(accentTokens('#B04DE0').accentText).toBe(THEME.text);
    expect(accentTokens('#2FB36B').accentText).toBe('#2FB36B');
  });

  it('todo acento de texto del catálogo cumple 4.5:1 en fondo y superficie', () => {
    for (const d of DEMO_CATALOG) {
      const { accentText } = accentTokens(d.color);
      expect(contrastRatio(accentText, THEME.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(accentText, THEME.surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('color inválido cae al texto base', () => {
    expect(accentTokens('rojo').accent).toBe(THEME.text);
  });
});
