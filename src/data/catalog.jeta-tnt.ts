/**
 * Catálogo Jeta TNT (6 bebidas).
 *
 * - Imágenes aportadas por el usuario el 2026-10-06; recortadas con
 *   scripts/cutout-cans.py (los originales no se versionan).
 * - Descripciones PROVISIONALES: describen el diseño de la lata y el nombre
 *   de la variante. No contienen afirmaciones de sabor, salud ni rendimiento.
 * - Características pendientes: la etiqueta muestra «500 ML», pero no hay una
 *   fuente verificada registrada, así que no se publica ninguna cifra (PD-03).
 */
import type { Drink, MassUnit, Measure, VolumeUnit } from './contract';

const IMAGES = import.meta.glob<string>('../assets/cans/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

function pending<U extends string>(): Measure<U> {
  return { value: null, unit: null, basis: null, verification: 'pending', sourceId: null };
}

const BRAND = 'Jeta TNT';

function drink(
  id: string,
  name: string,
  flavors: Drink['flavors'],
  color: string,
  description: string,
): Drink {
  const src = IMAGES[`../assets/cans/jeta-tnt-${id}.webp`];
  if (src === undefined) throw new Error(`Falta la imagen jeta-tnt-${id}.webp`);
  return {
    id,
    name,
    brand: BRAND,
    flavors,
    description,
    image: { src, alt: `Lata de ${BRAND} ${name}`, width: 468, height: 1154, kind: 'authorized' },
    color,
    volume: pending<VolumeUnit>(),
    caffeine: pending<MassUnit>(),
    sugar: pending<MassUnit>(),
    sources: [],
    provisional: true,
  };
}

export const JETA_TNT_CATALOG: Drink[] = [
  drink(
    'citrus-shock',
    'Citrus Shock',
    ['citrico'],
    '#C6F02E',
    'La variante cítrica de la gama. Lata negra con destellos lima y amarillo y rodajas de limón y lima en el diseño.',
  ),
  drink(
    'blue-voltage',
    'Blue Voltage',
    [],
    '#2F86FF',
    'Lata negra atravesada por rayos azul eléctrico. El perfil de sabor está pendiente de confirmar.',
  ),
  drink(
    'original-blast',
    'Original Blast',
    ['original'],
    '#FF3B2F',
    'La variante original de la gama, con grietas de luz roja sobre la lata negra.',
  ),
  drink(
    'cherry-nitro',
    'Cherry Nitro',
    ['cereza'],
    '#FF2E63',
    'La variante de cereza. Diseño en rojo y magenta con cerezas alrededor del cartucho de TNT.',
  ),
  drink(
    'tropical-detonator',
    'Tropical Detonator',
    ['tropical'],
    '#FF8C1A',
    'La variante tropical, con un diseño en naranja y turquesa. Las frutas concretas están pendientes de confirmar.',
  ),
  drink(
    'zero-ice',
    'Zero Ice',
    [],
    '#5CD6FF',
    'Lata negra con hielo y detalles azul glaciar. El perfil de sabor y la composición están pendientes de confirmar.',
  ),
];
