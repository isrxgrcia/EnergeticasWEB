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
import { JETA_TNT_CATALOG as CATALOG } from '../../src/data/catalog.jeta-tnt';
import { FLAVORS } from '../../src/data/contract';
import { fixtureDrink } from './fixtures';

afterEach(() => __setCatalogForTests(CATALOG));

describe('catálogo Jeta TNT', () => {
  it('seis bebidas con ids únicos y aptos para URL', () => {
    const ids = CATALOG.map((d) => d.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('no publica cifras: todas las características están pendientes', () => {
    for (const d of CATALOG) {
      expect(d.provisional).toBe(true);
      for (const m of [d.volume, d.caffeine, d.sugar]) {
        expect(m.value).toBeNull();
        expect(m.verification).toBe('pending');
      }
    }
  });

  it('cada bebida tiene imagen con alt y dimensiones', () => {
    for (const d of CATALOG) {
      expect(d.image?.src).toBeTruthy();
      expect(d.image?.alt).toContain(d.name);
      expect(d.image?.width).toBeGreaterThan(0);
    }
  });

  it('sabores del vocabulario (0–3) y colores hex', () => {
    for (const d of CATALOG) {
      expect(d.flavors.length).toBeLessThanOrEqual(3);
      for (const f of d.flavors) expect(Object.keys(FLAVORS)).toContain(f);
      expect(d.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('las descripciones no contienen cifras ni afirmaciones de rendimiento', () => {
    for (const d of CATALOG) {
      expect(d.description).not.toMatch(/\d/);
      expect(d.description).not.toMatch(/energ[íi]a|rendimiento|concentraci[óo]n|salud/i);
    }
  });
});

describe('operaciones (F02)', () => {
  it('listar devuelve todo', () => {
    expect(listDrinks()).toHaveLength(CATALOG.length);
  });

  it('consultar por id existente e inexistente', () => {
    expect(getDrinkById('cherry-nitro')?.name).toBe('Cherry Nitro');
    expect(getDrinkById('no-existe')).toBeNull();
  });

  it('sin filtros devuelve todo', () => {
    expect(filterDrinks({ brand: null, flavor: null })).toHaveLength(CATALOG.length);
  });

  it('combina marca Y sabor', () => {
    expect(filterDrinks({ brand: 'jeta-tnt', flavor: 'citrico' }).map((d) => d.id)).toEqual(['citrus-shock']);
  });

  it('las bebidas con sabor por confirmar solo aparecen sin filtro de sabor', () => {
    const conSabor = new Set(flavorOptions().flatMap((o) => filterDrinks({ brand: null, flavor: o.value }).map((d) => d.id)));
    expect(conSabor.has('blue-voltage')).toBe(false);
    expect(conSabor.has('zero-ice')).toBe(false);
  });

  it('opciones de filtro derivadas del catálogo', () => {
    expect(brandOptions()).toEqual([{ value: 'jeta-tnt', label: 'Jeta TNT' }]);
    expect(flavorOptions().map((o) => o.value)).toEqual(['citrico', 'tropical', 'original', 'cereza']);
  });

  it('combinación sin coincidencias devuelve vacío', () => {
    __setCatalogForTests([
      fixtureDrink({ id: 'a', brand: 'Marca A', flavors: ['citrico'] }),
      fixtureDrink({ id: 'b', brand: 'Marca B', flavors: ['tropical'] }),
    ]);
    expect(filterDrinks({ brand: 'marca-a', flavor: 'tropical' })).toEqual([]);
  });

  it('descarta valores de filtro desconocidos', () => {
    expect(sanitizeFilter({ brand: 'inventada', flavor: 'citrico' })).toEqual({ brand: null, flavor: 'citrico' });
    expect(sanitizeFilter({ brand: null, flavor: 'uva' })).toEqual({ brand: null, flavor: null });
  });

  it('slug de marca sin acentos', () => {
    expect(brandSlug('Bebidas Ñandú Él')).toBe('bebidas-nandu-el');
    expect(brandSlug('Jeta TNT')).toBe('jeta-tnt');
  });

  it('catálogo vacío', () => {
    __setCatalogForTests([]);
    expect(listDrinks()).toEqual([]);
    expect(brandOptions()).toEqual([]);
    expect(filterDrinks({ brand: null, flavor: null })).toEqual([]);
  });
});
