import { afterEach, describe, expect, it } from 'vitest';
import {
  __setCatalogForTests,
  brandOptions,
  brandSlug,
  filterDrinks,
  flavorOptions,
  getDrinkById,
  listDrinks,
  sanitizeFilter,
} from '../../src/data/catalog';
import { DEMO_CATALOG } from '../../src/data/catalog.demo';
import { FLAVORS } from '../../src/data/contract';

afterEach(() => __setCatalogForTests(DEMO_CATALOG));

describe('catálogo de demostración', () => {
  it('ids únicos y aptos para URL', () => {
    const ids = DEMO_CATALOG.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('no contiene cifras nutricionales ni datos verificados', () => {
    for (const d of DEMO_CATALOG) {
      expect(d.demo).toBe(true);
      for (const m of [d.volume, d.caffeine, d.sugar]) {
        expect(m.value).toBeNull();
        expect(m.verification).not.toBe('verified');
      }
    }
  });

  it('sabores del vocabulario, 1–3 por bebida, y colores hex', () => {
    for (const d of DEMO_CATALOG) {
      expect(d.flavors.length).toBeGreaterThanOrEqual(1);
      expect(d.flavors.length).toBeLessThanOrEqual(3);
      for (const f of d.flavors) expect(Object.keys(FLAVORS)).toContain(f);
      expect(d.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('operaciones (F02)', () => {
  it('listar devuelve todo', () => {
    expect(listDrinks()).toHaveLength(DEMO_CATALOG.length);
  });

  it('consultar por id existente e inexistente', () => {
    expect(getDrinkById('demo-original')?.name).toBe('Demo Original');
    expect(getDrinkById('no-existe')).toBeNull();
  });

  it('sin filtros devuelve todo', () => {
    expect(filterDrinks({ brand: null, flavor: null })).toHaveLength(DEMO_CATALOG.length);
  });

  it('combina marca Y sabor', () => {
    const r = filterDrinks({ brand: 'marca-demo-a', flavor: 'citrico' });
    expect(r.map((d) => d.id).sort()).toEqual(['demo-citrica', 'demo-tropical']);
  });

  it('una bebida con varios sabores aparece en cada uno', () => {
    expect(filterDrinks({ brand: null, flavor: 'tropical' }).map((d) => d.id)).toEqual(['demo-tropical']);
  });

  it('combinación sin coincidencias devuelve vacío', () => {
    expect(filterDrinks({ brand: 'marca-demo-c', flavor: 'citrico' })).toEqual([]);
  });

  it('opciones de filtro derivadas del catálogo', () => {
    expect(brandOptions().map((o) => o.label)).toEqual(['Marca Demo A', 'Marca Demo B', 'Marca Demo C']);
    expect(flavorOptions().map((o) => o.value)).toEqual(['citrico', 'frutos-rojos', 'tropical', 'original', 'menta', 'uva']);
  });

  it('descarta valores de filtro desconocidos', () => {
    expect(sanitizeFilter({ brand: 'inventada', flavor: 'citrico' })).toEqual({ brand: null, flavor: 'citrico' });
  });

  it('slug de marca sin acentos', () => {
    expect(brandSlug('Bebidas Ñandú Él')).toBe('bebidas-nandu-el');
  });

  it('catálogo vacío', () => {
    __setCatalogForTests([]);
    expect(listDrinks()).toEqual([]);
    expect(brandOptions()).toEqual([]);
    expect(filterDrinks({ brand: null, flavor: null })).toEqual([]);
  });
});
