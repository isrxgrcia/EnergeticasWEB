import type { Drink, Measure } from '../data/contract';

export type FeatureKey = 'volume' | 'caffeine' | 'sugar';

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  volume: 'Volumen',
  caffeine: 'Cafeína',
  sugar: 'Azúcar',
};

export type FeatureDisplay =
  | { kind: 'value'; text: string; sourceLabel: string; sourceUrl: string | null }
  | { kind: 'unverified'; text: 'Información no verificada' }
  | { kind: 'pending'; text: 'Información pendiente' };

const BASIS_TEXT = { per_container: 'por envase', per_100ml: 'por 100 ml' } as const;

const numberFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

/**
 * Regla de presentación (PR-11). Una cifra solo se muestra si el campo:
 * tiene valor, unidad, base (salvo volumen), está verificado y su fuente existe.
 * Cualquier otra combinación se degrada a «no verificada» o «pendiente».
 * Nunca convierte bases ni rellena ausencias con 0.
 */
export function describeFeature(drink: Drink, key: FeatureKey): FeatureDisplay {
  const m: Measure<string> = drink[key];
  if (m.value === null && m.verification !== 'unverified') {
    return { kind: 'pending', text: 'Información pendiente' };
  }
  const source = m.sourceId === null ? undefined : drink.sources.find((s) => s.id === m.sourceId);
  const needsBasis = key !== 'volume';
  const complete =
    m.value !== null &&
    Number.isFinite(m.value) &&
    m.value >= 0 &&
    m.unit !== null &&
    (!needsBasis || m.basis !== null) &&
    source !== undefined;
  if (m.verification !== 'verified' || !complete) {
    return { kind: 'unverified', text: 'Información no verificada' };
  }
  const amount = `${numberFormat.format(m.value!)} ${m.unit}`;
  const basis = needsBasis ? ` ${BASIS_TEXT[m.basis!]}` : ' por envase';
  return { kind: 'value', text: amount + basis, sourceLabel: source!.label, sourceUrl: source!.url };
}
