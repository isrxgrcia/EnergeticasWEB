import type { Drink } from '../../src/data/contract';

/** Bebida de prueba (solo tests): las cifras son ficticias y nunca llegan a la UI. */
export function fixtureDrink(overrides: Partial<Drink> = {}): Drink {
  return {
    id: 'test-1',
    name: 'Prueba',
    brand: 'Marca Test',
    flavors: ['citrico'],
    description: 'Descripción de prueba.',
    image: null,
    color: '#3D7BFF',
    volume: { value: 500, unit: 'ml', basis: 'per_container', verification: 'verified', sourceId: 's1' },
    caffeine: { value: 32, unit: 'mg', basis: 'per_100ml', verification: 'verified', sourceId: 's1' },
    sugar: { value: null, unit: null, basis: null, verification: 'pending', sourceId: null },
    sources: [{ id: 's1', label: 'Etiqueta del envase (test)', url: null, accessed: '2026-01-01' }],
    demo: false,
    ...overrides,
  };
}
