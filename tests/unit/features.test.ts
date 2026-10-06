import { describe, expect, it } from 'vitest';
import { describeFeature } from '../../src/domain/features';
import { fixtureDrink } from './fixtures';

describe('describeFeature (F03)', () => {
  it('muestra cifra verificada con unidad, base y fuente', () => {
    const d = describeFeature(fixtureDrink(), 'caffeine');
    expect(d).toEqual({ kind: 'value', text: '32 mg por 100 ml', sourceLabel: 'Etiqueta del envase (test)', sourceUrl: null });
  });

  it('el volumen se expresa por envase', () => {
    expect(describeFeature(fixtureDrink(), 'volume')).toMatchObject({ kind: 'value', text: '500 ml por envase' });
  });

  it('ausencia de dato es «pendiente», nunca 0', () => {
    const d = describeFeature(fixtureDrink(), 'sugar');
    expect(d.kind).toBe('pending');
    expect(d.text).not.toMatch(/\d/);
  });

  it('el cero verificado sí es un valor', () => {
    const drink = fixtureDrink({
      sugar: { value: 0, unit: 'g', basis: 'per_100ml', verification: 'verified', sourceId: 's1' },
    });
    expect(describeFeature(drink, 'sugar')).toMatchObject({ kind: 'value', text: '0 g por 100 ml' });
  });

  it.each([
    ['sin verificar', { verification: 'unverified' as const }],
    ['sin unidad', { unit: null }],
    ['sin base', { basis: null }],
    ['sin fuente', { sourceId: null }],
    ['fuente inexistente', { sourceId: 'nope' }],
    ['valor negativo', { value: -1 }],
  ])('oculta la cifra si está %s', (_label, patch) => {
    const base = fixtureDrink();
    const drink = fixtureDrink({ caffeine: { ...base.caffeine, ...patch } });
    const d = describeFeature(drink, 'caffeine');
    expect(d.kind).toBe('unverified');
    expect(d.text).toBe('Información no verificada');
  });

  it('un dato anunciado sin valor ni verificación es «no verificada»', () => {
    const drink = fixtureDrink({
      caffeine: { value: null, unit: null, basis: null, verification: 'unverified', sourceId: null },
    });
    expect(describeFeature(drink, 'caffeine').kind).toBe('unverified');
  });
});
