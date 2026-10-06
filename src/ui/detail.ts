import type { Drink } from '../data/contract';
import { describeFeature, FEATURE_LABELS, type FeatureKey } from '../domain/features';
import { accentStyle, demoBadge, drinkImage, flavorTags, stateMessage } from './components';
import { h } from './dom';

export interface DetailCallbacks {
  backLabel: string;
  backHref: string;
  onBack(): void;
  onShowAll(): void;
}

const FEATURES: FeatureKey[] = ['volume', 'caffeine', 'sugar'];

export function renderDetail(drink: Drink | null, cb: DetailCallbacks): HTMLElement {
  const back = h('a', { href: cb.backHref, class: 'back-link', 'data-back': '' }, `← ${cb.backLabel}`);
  back.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    cb.onBack();
  });

  if (drink === null) {
    const all = h('a', { href: './', class: 'btn btn--primary' }, 'Ver todas las bebidas');
    all.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      cb.onShowAll();
    });
    const msg = stateMessage({
      kind: 'not-found',
      headingLevel: 'h2',
      title: 'Puede que el enlace sea incorrecto o que la bebida ya no forme parte del escaparate.',
      body: 'Vuelve al catálogo para ver las bebidas disponibles.',
      action: all,
    });
    return h(
      'article',
      { class: 'detail detail--missing' },
      back,
      h('h1', { id: 'detalle-titulo', tabindex: -1, class: 'detail__title' }, 'No encontramos esta bebida'),
      msg,
    );
  }

  const rows = FEATURES.map((key) => {
    const d = describeFeature(drink, key);
    const value =
      d.kind === 'value'
        ? h(
            'dd',
            { class: 'feature__value' },
            h('span', { class: 'feature__amount' }, d.text),
            h(
              'span',
              { class: 'feature__source' },
              'Fuente: ',
              d.sourceUrl ? h('a', { href: d.sourceUrl, rel: 'noopener', target: '_blank' }, d.sourceLabel, h('span', { class: 'visually-hidden' }, ' (abre en una pestaña nueva)')) : d.sourceLabel,
            ),
          )
        : h('dd', { class: `feature__value feature__value--${d.kind}` }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }), h('span', {}, d.text));
    return h('div', { class: 'feature', 'data-feature': key, 'data-kind': d.kind }, h('dt', {}, FEATURE_LABELS[key]), value);
  });

  const sources =
    drink.sources.length > 0
      ? h(
          'ul',
          { class: 'sources' },
          ...drink.sources.map((s) =>
            h(
              'li',
              {},
              s.url ? h('a', { href: s.url, rel: 'noopener', target: '_blank' }, s.label) : s.label,
              s.accessed ? ` (consultado el ${s.accessed})` : null,
            ),
          ),
        )
      : h('p', { class: 'muted' }, 'No hay fuentes registradas para esta bebida. Las características se mostrarán cuando estén verificadas.');

  return h(
    'article',
    { class: 'detail', style: accentStyle(drink), 'data-drink-id': drink.id },
    back,
    h(
      'div',
      { class: 'detail__layout' },
      h(
        'div',
        { class: 'detail__media' },
        h('div', { class: `ambience ambience--${drink.flavors[0] ?? 'original'}`, 'aria-hidden': 'true' }),
        drinkImage(drink, 'detail'),
      ),
      h(
        'div',
        { class: 'detail__info' },
        h('p', { class: 'brand' }, drink.brand),
        h('h1', { id: 'detalle-titulo', tabindex: -1, class: 'detail__title drink-name' }, drink.name),
        flavorTags(drink),
        drink.demo ? demoBadge() : null,
        h('h2', { class: 'section-title' }, 'Sabor'),
        h('p', { class: 'detail__desc' }, drink.description),
        h('h2', { class: 'section-title' }, 'Características'),
        h('dl', { class: 'features' }, ...rows),
        h(
          'p',
          { class: 'muted small' },
          'Solo se muestran cifras verificadas, con su unidad, base de medida y fuente. «Pendiente» o «no verificada» no significa cero.',
        ),
        h('h2', { class: 'section-title' }, 'Fuentes'),
        sources,
      ),
    ),
  );
}
