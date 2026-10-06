/**
 * Capa de acceso al catálogo local (CONTRATO PROVISIONAL).
 *
 * Operaciones del brief: listar, filtrar por marca/sabor y consultar por id.
 * Son síncronas sobre datos locales: no hay carga ni errores de red.
 * Para integrar el catálogo definitivo basta con sustituir `SOURCE` por los
 * datos autorizados adaptados a `Drink` (ver docs/reconciliacion-e01.md).
 */
import { JETA_TNT_CATALOG } from './catalog.jeta-tnt';
import { FLAVORS, type Drink, type FlavorKey } from './contract';

let SOURCE: readonly Drink[] = JETA_TNT_CATALOG;

/** Solo para pruebas: sustituye el catálogo (p. ej. catálogo vacío). */
export function __setCatalogForTests(drinks: readonly Drink[]): void {
  SOURCE = drinks;
}

export interface CatalogFilter {
  /** Slug de marca; `null` = todas. */
  brand: string | null;
  /** Clave de sabor; `null` = todos. */
  flavor: FlavorKey | null;
}

export const NO_FILTER: CatalogFilter = { brand: null, flavor: null };

export interface Option<V extends string> {
  value: V;
  label: string;
}

export function brandSlug(brand: string): string {
  return brand
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function listDrinks(): readonly Drink[] {
  return SOURCE;
}

export function getDrinkById(id: string): Drink | null {
  return SOURCE.find((d) => d.id === id) ?? null;
}

/** Semántica provisional: coincidencia en ambos criterios (Y); `null` = sin restricción. */
export function filterDrinks(filter: CatalogFilter): Drink[] {
  return SOURCE.filter(
    (d) =>
      (filter.brand === null || brandSlug(d.brand) === filter.brand) &&
      (filter.flavor === null || d.flavors.includes(filter.flavor)),
  );
}

export function brandOptions(): Option<string>[] {
  const seen = new Map<string, string>();
  for (const d of SOURCE) seen.set(brandSlug(d.brand), d.brand);
  return [...seen]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

/** Sabores presentes en el catálogo, en el orden del vocabulario. */
export function flavorOptions(): Option<FlavorKey>[] {
  const present = new Set(SOURCE.flatMap((d) => d.flavors));
  return (Object.keys(FLAVORS) as FlavorKey[])
    .filter((k) => present.has(k))
    .map((k) => ({ value: k, label: FLAVORS[k] }));
}

/** Descarta valores de filtro que no existen en el catálogo (p. ej. URL manipulada). */
export function sanitizeFilter(filter: CatalogFilter): CatalogFilter {
  const brands = new Set(brandOptions().map((o) => o.value));
  const flavors = new Set(flavorOptions().map((o) => o.value));
  return {
    brand: filter.brand !== null && brands.has(filter.brand) ? filter.brand : null,
    flavor: filter.flavor !== null && flavors.has(filter.flavor) ? filter.flavor : null,
  };
}
