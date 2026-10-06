# Decisión de stack (PD-04) — provisional

Estado: **propuesto**. Elegido para poder implementar la etapa 2 sin esperar; sustituible si el usuario decide otra cosa.

## Necesidades reales del MVP

- Tres vistas (P01, P02 como sección de P01, P03) y un catálogo **local, pequeño y síncrono**.
- Sin servidor, API, cuentas ni persistencia → sitio **estático**.
- Interacción: selección coordinada con transiciones interrumpibles, filtros y navegación con Atrás/URL.
- Accesibilidad y rendimiento prioritarios; pruebas de recorrido (F01–F04).

## Opciones evaluadas

| Opción | A favor | En contra | Veredicto |
|---|---|---|---|
| HTML/CSS/JS sin herramientas | Cero dependencias | Sin tipos para el contrato E01, sin empaquetado de fuentes ni pruebas cómodas | Descartada por mantenibilidad |
| **Vite + TypeScript sin framework** | Build estático mínimo (~7 kB JS gzip), tipos para el contrato provisional, servidor de desarrollo, encaja con Vitest | Renderizado DOM escrito a mano | **Elegida** |
| React/Vue/Svelte + Vite | Componentes declarativos | Dependencia y runtime innecesarios para 3 vistas; más superficie que mantener | Desproporcionada para el MVP |
| Astro / Next.js (SSG) | SEO, rutas por archivo | Rutas por ficha exigen generar páginas o configurar el servidor; islas para la interacción; más complejidad | Reconsiderar si el catálogo crece mucho o se necesita SEO por ficha |

## Elección

- **Vite 8 + TypeScript 5 (estricto)**, sin framework de UI. Módulos pequeños: `data/` (contrato y catálogo), `domain/` (reglas puras y testeables), `ui/` (vistas DOM).
- **Navegación por query string** (`?bebida=…&marca=…&sabor=…`) con History API: funciona en cualquier alojamiento estático sin reescrituras y soporta URL directa, recarga y Atrás. No se usa router.
- **Fuente display Anton** (OFL-1.1) autoalojada vía `@fontsource/anton`: sin peticiones a terceros. Texto con la pila del sistema.
- **Pruebas**: Vitest (reglas de dominio y catálogo) y Playwright + axe-core (recorridos, tamaños, accesibilidad automatizada). `@playwright/test` fijado en 1.56.1 para coincidir con el Chromium del entorno.
- `base: './'` en Vite: el `dist/` se puede servir desde cualquier subruta.

## Coste de cambiar de opinión

La lógica (`src/data`, `src/domain`) no depende del DOM; migrar a un framework solo reescribiría `src/ui`.
