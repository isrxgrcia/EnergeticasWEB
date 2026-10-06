import { describe, expect, it } from 'vitest';
import { buildSearch, parseRoute } from '../../src/domain/navigation';

describe('navegación', () => {
  it('inicio sin parámetros', () => {
    expect(parseRoute('')).toEqual({ view: 'home', drinkId: null, filter: { brand: null, flavor: null } });
  });

  it('detalle conserva filtros (ida y vuelta)', () => {
    const r = parseRoute('?bebida=demo-tropical&marca=marca-demo-a&sabor=citrico');
    expect(r).toEqual({ view: 'detail', drinkId: 'demo-tropical', filter: { brand: 'marca-demo-a', flavor: 'citrico' } });
    expect(buildSearch(r)).toBe('?bebida=demo-tropical&marca=marca-demo-a&sabor=citrico');
    expect(buildSearch({ ...r, view: 'home' })).toBe('?marca=marca-demo-a&sabor=citrico');
  });

  it('ignora sabores fuera del vocabulario', () => {
    expect(parseRoute('?sabor=<script>').filter.flavor).toBeNull();
  });
});
