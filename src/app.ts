import { getDrinkById, listDrinks, sanitizeFilter, type CatalogFilter } from './data/catalog';
import type { Drink } from './data/contract';
import { buildSearch, parseRoute, type Route } from './domain/navigation';
import { renderDetail } from './ui/detail';
import { prefersReducedMotion } from './ui/dom';
import { renderHome, type HomeView } from './ui/home';
import { AppHistory } from './history';

const SITE = 'Energy Showcase';

/** Estado guardado en cada entrada del historial (sin datos personales). */
interface EntryState {
  app?: true;
  /** Desde dónde se abrió la ficha. */
  origin?: 'hero' | 'catalog';
  scrollY?: number;
  focusId?: string;
}

export function startApp(main: HTMLElement): void {
  let selectedId: string | null = listDrinks()[0]?.id ?? null;
  let home: HomeView | null = null;

  const nav = new AppHistory<EntryState>(() => render(true));
  const state = (): EntryState => nav.state;
  const currentRoute = (): Route => {
    const r = parseRoute(nav.search);
    return { ...r, filter: sanitizeFilter(r.filter) };
  };

  function selectedDrink(): Drink | null {
    return (selectedId && getDrinkById(selectedId)) || listDrinks()[0] || null;
  }

  let initial = true;

  function render(restore: boolean): void {
    const route = currentRoute();
    home = null;
    if (route.view === 'detail') {
      const drink = route.drinkId ? getDrinkById(route.drinkId) : null;
      const s = state();
      const backSearch = buildSearch({ view: 'home', drinkId: null, filter: route.filter });
      const view = renderDetail(drink, {
        backLabel: !s.app ? 'Ver el catálogo' : s.origin === 'hero' ? 'Volver al inicio' : 'Volver al catálogo',
        backHref: backSearch || './',
        onBack: () => goBack(route.filter),
        onShowAll: () => navigateHome({ brand: null, flavor: null }, 'explorer'),
      });
      main.replaceChildren(view);
      document.title = drink ? `${drink.name} — ${SITE}` : `Bebida no encontrada — ${SITE}`;
      window.scrollTo(0, 0);
      // En la carga inicial no se mueve el foco; tras navegar, va al título.
      if (!initial) main.querySelector<HTMLElement>('#detalle-titulo')?.focus();
      return;
    }

    const drink = selectedDrink();
    selectedId = drink?.id ?? null;
    home = renderHome(drink, route.filter, {
      search: () => nav.search,
      onSelect: (d) => {
        selectedId = d.id;
        home?.select(d, true);
      },
      onFilter: (filter) => {
        const search = buildSearch({ view: 'home', drinkId: null, filter });
        nav.replace(state(), search);
        home?.applyFilter(filter);
        home?.refreshLinks();
      },
      onExplore: focusExplorer,
    });
    main.replaceChildren(home.root);
    document.title = `${SITE} — Escaparate de bebidas energéticas`;

    const s = state();
    if (restore && s.scrollY !== undefined) {
      window.scrollTo(0, s.scrollY);
      const target =
        (s.focusId && document.getElementById(s.focusId)) || document.getElementById('explorar-titulo');
      target?.focus({ preventScroll: true });
    } else if (!restore) {
      window.scrollTo(0, 0);
    }
  }

  function focusExplorer(): void {
    const heading = document.getElementById('explorar-titulo');
    if (!heading) return;
    heading.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  }

  function openDetail(link: HTMLAnchorElement): void {
    // Guarda posición y foco de origen en la entrada actual antes de avanzar.
    nav.replace({ ...state(), scrollY: window.scrollY, focusId: link.id || undefined });
    const origin: EntryState['origin'] = link.id === 'hero-ver-ficha' ? 'hero' : 'catalog';
    nav.push({ app: true, origin }, link.getAttribute('href')!);
    render(false);
  }

  function goBack(filter: CatalogFilter): void {
    if (state().app) {
      nav.back(); // restaura filtros, posición y foco
      return;
    }
    navigateHome(filter, 'explorer');
  }

  function navigateHome(filter: CatalogFilter, focus: 'explorer' | 'top'): void {
    const search = buildSearch({ view: 'home', drinkId: null, filter });
    nav.push({ app: true }, search);
    render(false);
    if (focus === 'explorer') {
      document.getElementById('explorar')?.scrollIntoView({ block: 'start' });
      document.getElementById('explorar-titulo')?.focus({ preventScroll: true });
    } else {
      main.focus({ preventScroll: true });
    }
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = e.target as Element;
    if (target.closest('.site-nav__link')) {
      e.preventDefault();
      if (home) focusExplorer();
      else navigateHome(currentRoute().filter, 'explorer');
      return;
    }
    if (target.closest('.site-name')) {
      e.preventDefault();
      if (home) window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      else navigateHome(currentRoute().filter, 'top');
      return;
    }
    const link = target.closest<HTMLAnchorElement>('a[data-drink-link]');
    if (!link) return;
    e.preventDefault();
    openDetail(link);
  });

  window.addEventListener('popstate', () => render(true));
  render(true);
  initial = false;
}
