import { FLAVORS, type Drink } from '../data/contract';
import { accentTokens } from '../domain/contrast';
import { h, visuallyHidden } from './dom';

export function accentStyle(drink: Drink): string {
  const t = accentTokens(drink.color);
  return `--accent:${t.accent};--accent-text:${t.accentText};--accent-on:${t.accentOn}`;
}

export function provisionalBadge(short = false): HTMLElement {
  return h('span', { class: 'badge badge--demo' }, short ? 'Provisional' : 'Contenido provisional');
}

/** Clase del motivo de ambiente: primer sabor o neutro si está por confirmar. */
export function ambienceClass(drink: Drink): string {
  return `ambience ambience--${drink.flavors[0] ?? 'neutro'}`;
}

export function flavorTags(drink: Drink, withBadge = false): HTMLElement {
  const items =
    drink.flavors.length > 0
      ? drink.flavors.map((f) => h('li', { class: 'tag' }, FLAVORS[f]))
      : [h('li', { class: 'tag tag--pending' }, 'Sabor por confirmar')];
  const tags = h('ul', { class: 'tags', 'aria-label': 'Perfil de sabor' }, ...items);
  if (!withBadge || !drink.provisional) return tags;
  return h('div', { class: 'tags-row' }, tags, provisionalBadge(true));
}

/** Silueta identificada: no debe parecer una imagen definitiva. */
export function imagePlaceholder(drink: Drink, size: 'full' | 'short' | 'none' = 'full'): HTMLElement {
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', '0 0 400 880');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'can-placeholder__shape');
  const path = document.createElementNS(svgNs, 'path');
  path.setAttribute(
    'd',
    'M70 70 Q70 40 110 34 L290 34 Q330 40 330 70 L338 110 L338 790 L330 830 Q330 852 290 856 L110 856 Q70 852 70 830 L62 790 L62 110 Z',
  );
  svg.append(path);
  // En miniaturas es decorativo, igual que la imagen (alt=""): el nombre ya está en el botón.
  const a11y =
    size === 'none'
      ? { 'aria-hidden': 'true' }
      : { role: 'img', 'aria-label': `Imagen no disponible de «${drink.name}»` };
  return h(
    'div',
    { class: 'can-placeholder', ...a11y },
    svg,
    size === 'none'
      ? null
      : size === 'short'
        ? h('span', { class: 'can-placeholder__text can-placeholder__text--short', 'aria-hidden': 'true' }, 'Sin imagen')
        : h(
            'span',
            { class: 'can-placeholder__text', 'aria-hidden': 'true' },
            h('strong', {}, 'Imagen no disponible'),
            h('span', {}, drink.name),
          ),
  );
}

export type ImageVariant = 'hero' | 'card' | 'thumb' | 'detail';

/**
 * Imagen de lata con espacio reservado. Si falta o falla la carga, muestra el
 * placeholder conservando nombre y geometría.
 */
export function drinkImage(drink: Drink, variant: ImageVariant): HTMLElement {
  const frame = h('div', { class: `can can--${variant}` });
  if (drink.image) frame.style.aspectRatio = `${drink.image.width} / ${drink.image.height}`;
  const placeholderSize = variant === 'thumb' ? 'none' : variant === 'card' ? 'short' : 'full';
  if (!drink.image) {
    frame.append(imagePlaceholder(drink, placeholderSize));
    return frame;
  }
  const eager = variant === 'hero' || variant === 'detail';
  const img = h('img', {
    src: drink.image.src,
    alt: variant === 'thumb' ? '' : drink.image.alt,
    width: drink.image.width,
    height: drink.image.height,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: variant === 'hero' ? 'high' : null,
  });
  img.addEventListener(
    'error',
    () => {
      frame.dataset.imageState = 'error';
      img.replaceWith(imagePlaceholder(drink, placeholderSize));
    },
    { once: true },
  );
  frame.append(img);
  return frame;
}

export function stateMessage(opts: {
  title: string;
  body: string;
  action?: HTMLElement;
  headingLevel?: 'h2' | 'h3';
  kind: string;
}): HTMLElement {
  return h(
    'div',
    { class: 'state', 'data-state': opts.kind },
    h(opts.headingLevel ?? 'h3', { class: 'state__title' }, opts.title),
    h('p', { class: 'state__body' }, opts.body),
    opts.action ?? null,
  );
}

export function detailHref(drinkId: string, search: string): string {
  const p = new URLSearchParams(search);
  p.delete('bebida');
  const rest = p.toString();
  return `?bebida=${encodeURIComponent(drinkId)}${rest ? `&${rest}` : ''}`;
}

export function fichaLink(drink: Drink, search: string, opts: { id?: string; className: string; label?: string }): HTMLAnchorElement {
  return h(
    'a',
    { href: detailHref(drink.id, search), class: opts.className, id: opts.id, 'data-drink-link': drink.id },
    opts.label ?? 'Ver ficha',
    visuallyHidden(` de ${drink.name}`),
  );
}
