import {
  brandOptions,
  filterDrinks,
  flavorOptions,
  listDrinks,
  type CatalogFilter,
} from '../data/catalog';
import { FLAVORS, type Drink } from '../data/contract';
import {
  accentStyle,
  drinkImage,
  fichaLink,
  flavorTags,
  stateMessage,
} from './components';
import { enter, h } from './dom';

export interface HomeCallbacks {
  /** Búsqueda actual (para construir enlaces que conservan filtros). */
  search(): string;
  onSelect(drink: Drink): void;
  onFilter(filter: CatalogFilter): void;
  onExplore(): void;
}

export interface HomeView {
  root: DocumentFragment;
  /** Actualiza la presentación protagonista (F01). */
  select(drink: Drink, animate: boolean): void;
  /** Actualiza filtros, contador y catálogo (F02). */
  applyFilter(filter: CatalogFilter): void;
  /** Refresca los `href` de fichas tras cambiar la URL. */
  refreshLinks(): void;
}

export function renderHome(
  selected: Drink | null,
  filter: CatalogFilter,
  cb: HomeCallbacks,
): HomeView {
  const root = document.createDocumentFragment();
  const all = listDrinks();

  // ---------- P01 Presentación protagonista ----------
  const showcase = h('section', { class: 'showcase', 'aria-labelledby': 'proposito' });
  const intro = h(
    'div',
    { class: 'showcase__intro' },
    h('h1', { id: 'proposito', class: 'purpose' }, 'Descubre bebidas, explora sabores y consulta sus características.'),
  );
  const ambience = h('div', { class: 'ambience', 'aria-hidden': 'true' });
  const stage = h('div', { class: 'showcase__stage' }, ambience);
  const info = h('div', { class: 'showcase__info' });
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' });
  showcase.append(intro, info, stage, live);
  root.append(showcase);

  let liveTimer: number | undefined;
  let selectorButtons: HTMLButtonElement[] = [];

  function select(drink: Drink, animate: boolean): void {
    // Todo se deriva de la misma bebida: no hay estados parciales que mezclar.
    showcase.setAttribute('style', accentStyle(drink));
    showcase.dataset.drinkId = drink.id;
    ambience.className = `ambience ambience--${drink.flavors[0] ?? 'original'}`;

    const textBlock = h(
      'div',
      { class: 'showcase__text' },
      h('p', { class: 'brand' }, drink.brand),
      h('h2', { class: 'drink-name', id: 'nombre-bebida' }, drink.name),
      flavorTags(drink, true),
      h('p', { class: 'showcase__desc' }, drink.description),
    );
    const actions = h(
      'div',
      { class: 'actions' },
      fichaLink(drink, cb.search(), { id: 'hero-ver-ficha', className: 'btn btn--primary' }),
      h('a', { href: '#explorar', class: 'btn btn--secondary', 'data-explore': '' }, 'Explorar bebidas'),
    );
    info.replaceChildren(textBlock, actions);

    const image = drinkImage(drink, 'hero');
    stage.replaceChildren(ambience, image);

    for (const b of selectorButtons) {
      b.setAttribute('aria-pressed', String(b.dataset.drinkId === drink.id));
    }

    if (animate) {
      enter(textBlock, '--dur-fast');
      enter(image, '--dur-base', 12);
      window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(() => {
        live.textContent = `${drink.name} seleccionada`;
      }, 300);
    }
  }

  if (selected === null) {
    stage.hidden = true;
    info.append(
      stateMessage({
        kind: 'catalog-empty',
        title: 'Todavía no hay bebidas en el escaparate.',
        body: 'Cuando se añadan bebidas al catálogo aparecerán aquí.',
      }),
    );
  } else {
    // ---------- Selector ----------
    selectorButtons = all.map((d) =>
      h(
        'button',
        { type: 'button', class: 'selector__option', 'data-drink-id': d.id, 'aria-pressed': 'false', style: accentStyle(d) },
        drinkImage(d, 'thumb'),
        h('span', { class: 'selector__label' }, d.name),
      ),
    );
    const list = h('ul', { class: 'selector__list' }, ...selectorButtons.map((b) => h('li', {}, b)));
    const selector = h(
      'nav',
      { class: 'selector', 'aria-label': 'Elegir bebida' },
      h('p', { class: 'selector__hint', id: 'selector-hint' }, `${all.length} bebidas · elige una para verla`),
      h('div', { class: 'selector__scroller' }, list),
    );
    showcase.append(selector);
    list.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-drink-id]');
      const drink = btn && all.find((d) => d.id === btn.dataset.drinkId);
      if (drink) cb.onSelect(drink);
    });
    list.addEventListener('focusin', (e) => {
      (e.target as Element).scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    select(selected, false);
  }

  info.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-explore]')) {
      e.preventDefault();
      cb.onExplore();
    }
  });

  // ---------- P02 Explorador ----------
  const explorer = h('section', { class: 'explorer', id: 'explorar', 'aria-labelledby': 'explorar-titulo' });
  explorer.append(
    h(
      'div',
      { class: 'explorer__head' },
      h('h2', { id: 'explorar-titulo', tabindex: -1 }, 'Explorar bebidas'),
      h('p', { class: 'muted' }, 'Filtra por marca y perfil de sabor, y abre la ficha de cada bebida.'),
    ),
  );
  root.append(explorer);

  const brandSelect = h('select', { id: 'filtro-marca', name: 'marca' });
  const flavorSelect = h('select', { id: 'filtro-sabor', name: 'sabor' });
  const resetBtn = h('button', { type: 'reset', class: 'btn btn--ghost', hidden: true }, 'Restablecer filtros');
  const status = h('p', { class: 'results-summary', role: 'status' });
  const grid = h('ul', { class: 'catalog', 'aria-labelledby': 'explorar-titulo' });
  const empty = h('div', { class: 'catalog-empty-slot' });

  if (all.length === 0) {
    explorer.append(
      stateMessage({
        kind: 'catalog-empty',
        title: 'Todavía no hay bebidas en el escaparate.',
        body: 'No hay nada que filtrar por ahora.',
      }),
    );
  } else {
    brandSelect.append(
      h('option', { value: '' }, 'Todas las marcas'),
      ...brandOptions().map((o) => h('option', { value: o.value }, o.label)),
    );
    flavorSelect.append(
      h('option', { value: '' }, 'Todos los sabores'),
      ...flavorOptions().map((o) => h('option', { value: o.value }, o.label)),
    );
    const form = h(
      'form',
      { class: 'filters', role: 'search', 'aria-label': 'Filtrar bebidas' },
      h('div', { class: 'field' }, h('label', { for: 'filtro-marca' }, 'Marca'), brandSelect),
      h('div', { class: 'field' }, h('label', { for: 'filtro-sabor' }, 'Sabor'), flavorSelect),
      h('div', { class: 'field field--action' }, resetBtn),
    );
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('change', () => {
      cb.onFilter(readForm());
    });
    form.addEventListener('reset', (e) => {
      e.preventDefault();
      cb.onFilter({ brand: null, flavor: null });
      // El botón desaparece: el foco pasa al primer filtro para no perderse.
      brandSelect.focus();
    });
    explorer.append(form, status, grid, empty);
  }

  function readForm(): CatalogFilter {
    const flavor = flavorSelect.value;
    return {
      brand: brandSelect.value || null,
      flavor: flavor && flavor in FLAVORS ? (flavor as CatalogFilter['flavor']) : null,
    };
  }

  function applyFilter(f: CatalogFilter): void {
    if (all.length === 0) return;
    brandSelect.value = f.brand ?? '';
    flavorSelect.value = f.flavor ?? '';
    const active = f.brand !== null || f.flavor !== null;
    resetBtn.hidden = !active;

    const results = filterDrinks(f);
    const search = cb.search();
    grid.replaceChildren(...results.map((d) => card(d, search)));
    grid.hidden = results.length === 0;

    const parts: string[] = [];
    if (f.brand !== null) parts.push(brandSelect.selectedOptions[0]?.textContent ?? '');
    if (f.flavor !== null) parts.push(FLAVORS[f.flavor]);
    const count = results.length === 1 ? '1 bebida' : `${results.length} bebidas`;
    const text = [count, ...parts].join(' · ');
    if (status.textContent !== text) status.textContent = text;
    status.dataset.count = String(results.length);

    if (results.length === 0) {
      const reset = h('button', { type: 'button', class: 'btn btn--primary' }, 'Restablecer filtros');
      reset.addEventListener('click', () => {
        cb.onFilter({ brand: null, flavor: null });
        brandSelect.focus();
      });
      empty.replaceChildren(
        stateMessage({
          kind: 'no-results',
          title: 'Ninguna bebida coincide con estos filtros.',
          body: `No hay resultados para ${parts.join(' y ')}. Prueba con otra combinación.`,
          action: reset,
        }),
      );
    } else {
      empty.replaceChildren();
    }
  }

  function refreshLinks(): void {
    const search = cb.search();
    for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-drink-link]')) {
      const p = new URLSearchParams(search);
      p.delete('bebida');
      const rest = p.toString();
      a.href = `?bebida=${encodeURIComponent(a.dataset.drinkLink!)}${rest ? `&${rest}` : ''}`;
    }
  }

  applyFilter(filter);
  return { root, select, applyFilter, refreshLinks };
}

function card(drink: Drink, search: string): HTMLLIElement {
  return h(
    'li',
    {},
    h(
      'article',
      { class: 'card', style: accentStyle(drink), 'data-drink-id': drink.id },
      h('div', { class: 'card__media' }, drinkImage(drink, 'card')),
      h(
        'div',
        { class: 'card__body' },
        h('h3', { class: 'card__name' }, drink.name),
        h('p', { class: 'brand' }, drink.brand),
        flavorTags(drink, true),
        fichaLink(drink, search, { id: `tarjeta-${drink.id}`, className: 'card__link' }),
      ),
    ),
  );
}
