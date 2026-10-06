/**
 * CONTRATO PROVISIONAL de E01 «Bebida».
 *
 * Representación propuesta por el frontend a la espera del contrato técnico del
 * Arquitecto Backend de Prompts (ver docs/reconciliacion-e01.md). La interfaz
 * solo depende de estos tipos y del repositorio en ./catalog.ts, de modo que el
 * formato definitivo pueda sustituirlo sin tocar la presentación.
 */

export const CONTRACT_STATUS = 'provisional' as const;

/** Estado de verificación por campo. Un estado global no valida cifras sueltas. */
export type Verification = 'verified' | 'unverified' | 'pending';

/** Base de medida explícita; nunca se convierte entre bases. */
export type MeasureBasis = 'per_container' | 'per_100ml';

export type VolumeUnit = 'ml';
export type MassUnit = 'mg' | 'g';

export interface Measure<U extends string> {
  /** `null` = ausencia de dato. Nunca equivale a 0. */
  value: number | null;
  unit: U | null;
  /** El volumen es intrínsecamente por envase; cafeína y azúcar exigen base. */
  basis: MeasureBasis | null;
  verification: Verification;
  /** Referencia a `Drink.sources[].id`. Obligatoria para mostrar una cifra. */
  sourceId: string | null;
}

export interface Source {
  id: string;
  label: string;
  url: string | null;
  /** Fecha de consulta ISO (AAAA-MM-DD). */
  accessed: string | null;
}

export interface DrinkImage {
  src: string;
  /** Texto alternativo descriptivo de la lata. */
  alt: string;
  width: number;
  height: number;
  /** Placeholder o recurso autorizado; los placeholders se señalan en la UI. */
  kind: 'placeholder' | 'authorized';
}

export interface Drink {
  /** Estable y apto para URL. */
  id: string;
  name: string;
  brand: string;
  /** Claves del vocabulario provisional de sabores (1–3). */
  flavors: FlavorKey[];
  description: string;
  /** `null` = imagen pendiente. */
  image: DrinkImage | null;
  /** Hex #RRGGBB. Solo decorativo salvo que supere contraste (ver domain/contrast.ts). */
  color: string;
  volume: Measure<VolumeUnit>;
  caffeine: Measure<MassUnit>;
  sugar: Measure<MassUnit>;
  sources: Source[];
  /** Contenido de demostración: textos e imágenes no reales. */
  demo: boolean;
}

/** Vocabulario provisional de perfiles de sabor (pendiente PD-06). */
export const FLAVORS = {
  citrico: 'Cítrico',
  'frutos-rojos': 'Frutos rojos',
  tropical: 'Tropical',
  original: 'Original',
  menta: 'Mentolado',
  uva: 'Uva',
} as const;

export type FlavorKey = keyof typeof FLAVORS;

export function isFlavorKey(value: string): value is FlavorKey {
  return Object.hasOwn(FLAVORS, value);
}
