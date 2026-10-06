import { isFlavorKey } from '../data/contract';
import type { CatalogFilter } from '../data/catalog';

/**
 * Estado direccionable (PR-04, PR-05). Todo vive en la query string para que
 * funcione en cualquier alojamiento estático sin reescrituras:
 *   ?marca=<slug>&sabor=<clave>           → P01 + P02
 *   ?bebida=<id>&marca=…&sabor=…          → P03 (conserva filtros para volver)
 */
export interface Route {
  view: 'home' | 'detail';
  drinkId: string | null;
  filter: CatalogFilter;
}

export function parseRoute(search: string): Route {
  const p = new URLSearchParams(search);
  const flavor = p.get('sabor');
  const brand = p.get('marca');
  const id = p.get('bebida');
  return {
    view: id !== null ? 'detail' : 'home',
    drinkId: id,
    filter: {
      brand: brand && brand.length > 0 ? brand : null,
      flavor: flavor !== null && isFlavorKey(flavor) ? flavor : null,
    },
  };
}

export function buildSearch(route: Route): string {
  const p = new URLSearchParams();
  if (route.view === 'detail' && route.drinkId !== null) p.set('bebida', route.drinkId);
  if (route.filter.brand !== null) p.set('marca', route.filter.brand);
  if (route.filter.flavor !== null) p.set('sabor', route.filter.flavor);
  const s = p.toString();
  return s ? `?${s}` : '';
}
