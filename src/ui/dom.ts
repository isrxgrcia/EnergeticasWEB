type Child = Node | string | null | undefined | false;
type Attrs = Record<string, string | number | boolean | null | undefined> & {
  class?: string;
  style?: string;
};

/** Crea un elemento con atributos e hijos. `false`/`null` omiten el atributo. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v === null || v === undefined) continue;
    el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c);
  }
  return el;
}

export function visuallyHidden(text: string): HTMLSpanElement {
  return h('span', { class: 'visually-hidden' }, text);
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Cancela animaciones en curso y reproduce una entrada breve (interrumpible). */
export function enter(el: Element, durationVar: '--dur-fast' | '--dur-base', shift = 0): void {
  for (const a of el.getAnimations()) a.cancel();
  if (prefersReducedMotion()) return;
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(durationVar)) || 0;
  if (duration === 0) return;
  el.animate(
    [
      { opacity: 0, transform: `translateY(${shift}px)` },
      { opacity: 1, transform: 'none' },
    ],
    { duration, easing: 'cubic-bezier(.2,.7,.2,1)' },
  );
}
