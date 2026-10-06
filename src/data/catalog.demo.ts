/**
 * CONTENIDO DE DEMOSTRACIÓN — bebidas y marcas ficticias.
 *
 * - Ninguna marca, nombre o imagen corresponde a un producto real.
 * - No contiene cifras nutricionales: todos los campos están pendientes o sin
 *   verificar, con `value: null`. No se deben añadir cifras inventadas.
 * - Se sustituirá por el catálogo autorizado (PD-01, PD-02, PD-03).
 */
import type { Drink, Measure, MassUnit, VolumeUnit } from './contract';

function pending<U extends string>(): Measure<U> {
  return { value: null, unit: null, basis: null, verification: 'pending', sourceId: null };
}

/** Dato anunciado pero no verificado: la UI nunca muestra la cifra. */
function unverified<U extends string>(): Measure<U> {
  return { value: null, unit: null, basis: null, verification: 'unverified', sourceId: null };
}

// Las latas de demostración se empaquetan con la app (pequeñas: se incrustan).
const DEMO_IMAGES = import.meta.glob<string>('../assets/demo/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

function demoImage(id: string, name: string) {
  const src = DEMO_IMAGES[`../assets/demo/${id}.svg`];
  if (src === undefined) throw new Error(`Falta la imagen de demostración ${id}.svg`);
  return {
    src,
    alt: `Lata ilustrada de demostración de «${name}»`,
    width: 400,
    height: 880,
    kind: 'placeholder' as const,
  };
}

const vol = pending<VolumeUnit>;
const mass = pending<MassUnit>;

export const DEMO_CATALOG: Drink[] = [
  {
    id: 'demo-citrica',
    name: 'Demo Cítrica',
    brand: 'Marca Demo A',
    flavors: ['citrico'],
    description:
      'Texto de ejemplo: perfil ácido y luminoso, pensado para mostrar cómo se presenta un sabor cítrico.',
    image: demoImage('demo-citrica', 'Demo Cítrica'),
    color: '#C8E038',
    volume: vol(),
    caffeine: mass(),
    sugar: mass(),
    sources: [],
    demo: true,
  },
  {
    id: 'demo-bosque-rojo',
    name: 'Demo Bosque Rojo',
    brand: 'Marca Demo B',
    flavors: ['frutos-rojos'],
    description:
      'Texto de ejemplo: notas de frutos rojos con un final intenso. Sirve para probar la composición.',
    image: demoImage('demo-bosque-rojo', 'Demo Bosque Rojo'),
    color: '#E8442E',
    volume: unverified<VolumeUnit>(),
    caffeine: unverified<MassUnit>(),
    sugar: mass(),
    sources: [],
    demo: true,
  },
  {
    id: 'demo-tropical',
    name: 'Demo Tropical',
    brand: 'Marca Demo A',
    flavors: ['tropical', 'citrico'],
    description:
      'Texto de ejemplo: combinación tropical con un toque cítrico, para comprobar varias etiquetas de sabor.',
    image: demoImage('demo-tropical', 'Demo Tropical'),
    color: '#FF8A1F',
    volume: vol(),
    caffeine: mass(),
    sugar: mass(),
    sources: [],
    demo: true,
  },
  {
    id: 'demo-original',
    name: 'Demo Original',
    brand: 'Marca Demo C',
    flavors: ['original'],
    description:
      'Texto de ejemplo: el perfil clásico de la categoría, usado como referencia en el escaparate.',
    image: demoImage('demo-original', 'Demo Original'),
    color: '#3D7BFF',
    volume: vol(),
    caffeine: mass(),
    sugar: unverified<MassUnit>(),
    sources: [],
    demo: true,
  },
  {
    id: 'demo-menta-glaciar',
    name: 'Demo Menta Glaciar',
    brand: 'Marca Demo B',
    flavors: ['menta'],
    description:
      'Texto de ejemplo: sensación fresca y mentolada, para mostrar un ambiente frío.',
    image: demoImage('demo-menta-glaciar', 'Demo Menta Glaciar'),
    color: '#2FD3C0',
    volume: vol(),
    caffeine: mass(),
    sugar: mass(),
    sources: [],
    demo: true,
  },
  {
    id: 'demo-uva-nocturna',
    name: 'Demo Uva Nocturna',
    brand: 'Marca Demo C',
    flavors: ['uva'],
    description:
      'Texto de ejemplo: perfil de uva oscuro. Esta bebida no tiene imagen, para mostrar el estado «Imagen no disponible».',
    image: null,
    color: '#B04DE0',
    volume: vol(),
    caffeine: mass(),
    sugar: mass(),
    sources: [],
    demo: true,
  },
];
