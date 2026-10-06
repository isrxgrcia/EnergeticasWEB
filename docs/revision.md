# Revisión visual, funcional y accesible — Etapa 4

Estado: **propuesto**. Este informe no implica aprobación del usuario ni certifica la conformidad con WCAG.
Limitación de partida: la integración definitiva de E01 está **bloqueada** porque falta el contrato del Arquitecto Backend de Prompts (ver `reconciliacion-e01.md`). Se ha auditado la versión con contenido de demostración.

## 1. Cómo se ha comprobado

| Herramienta | Alcance | Resultado |
|---|---|---|
| `tsc --noEmit` (estricto) | Todo el código | Sin errores |
| Vitest | 31 pruebas: regla F03, operaciones del catálogo, navegación, contraste e integridad del catálogo de demostración | 31/31 |
| Playwright (Chromium 1194) | 31 pruebas × 2 proyectos (escritorio 1280×800 y móvil 360×740 táctil) = 62 | 62/62 |
| axe-core (WCAG 2.0/2.1/2.2 A y AA) | Inicio, ficha, ficha inexistente, sin resultados y filtro por sabor | 0 infracciones detectadas |
| Capturas revisadas a mano | 320×640, 360×640, 360×740, 1280×600, 1280×800, foco por teclado, ficha sin imagen, sin resultados, id inexistente, espaciado de texto aumentado, catálogo vacío (build temporal) | Ver §3 |

Comando: `npm run check`. Todas las pruebas comprueban además que **no hay errores de consola**.

## 2. Evidencia por criterio

| Criterio | Evidencia |
|---|---|
| **P01** protagonista inmediato | La lata, el `h1` de propósito, «Ver ficha» y «Explorar bebidas» quedan dentro de la pantalla en 360×640, 360×740, 1280×600 y 1280×800 (prueba `acciones en la primera pantalla`) |
| **F01** selección coherente | Cinco clics seguidos terminan en la última bebida: nombre, `alt`, `src`, enlace de ficha, `--accent` y `aria-pressed` coinciden. Todo se deriva de un único `selectedId` |
| **F01** sin bloqueo | Las animaciones se cancelan y reinician con la Web Animations API; los controles nunca se deshabilitan |
| **F02** filtros combinados | Marca Y sabor; contador «2 bebidas · Marca Demo A · Cítrico»; filtros reflejados en la URL |
| **F02** volver conservando filtros | Con el botón «Volver» y con Atrás del navegador: valores, resultados, posición (±2 px) y foco en la tarjeta de origen |
| **F02** sin resultados | Mensaje propio y botón «Restablecer filtros»; el foco va al primer filtro |
| **F03** datos | El catálogo de demo no tiene cifras (prueba de integridad). La ficha muestra «Información pendiente» o «no verificada» y la prueba confirma que no aparece ningún dígito. La regla de cifra verificada (unidad, base y fuente) está cubierta con datos de prueba que no llegan a la UI |
| **P03** detalle | URL directa, título del documento, foco en `h1` tras navegar (no en la carga inicial), «Volver al inicio» o «Volver al catálogo» según el origen |
| Id inexistente | «No encontramos esta bebida» + «Ver todas las bebidas» |
| Imagen ausente o fallida | Silueta discontinua con «Imagen no disponible» y el nombre, misma geometría. Comprobado abortando las peticiones de imagen |
| Catálogo vacío | Mensaje distinto de «sin resultados», sin selector ni filtros. Comprobado a mano con un build temporal; **sin prueba automatizada** |
| **F04** teclado | Enter y Espacio seleccionan sin mover el foco; foco visible de 3 px marfil; enlace «Saltar al contenido»; un solo enlace por tarjeta, aunque toda la tarjeta es clicable |
| **F04** movimiento reducido | Con `prefers-reduced-motion` no queda ninguna animación en curso tras seleccionar; la información y las funciones son las mismas |
| **F04** adaptable | Sin desplazamiento horizontal del documento en 320, 360, 414, 640 (equivale a zoom 200 % de 1280), 768, 1280 y 1920 px, ni en 1280×600. Catálogo en una columna a 320 px |

## 3. Defectos encontrados y corregidos en la revisión

| # | Defecto | Corrección | Archivo |
|---|---|---|---|
| 1 | Escritorio: selector fuera de la primera pantalla | `h1` dentro de la columna de información y rejilla por áreas | `src/ui/home.ts`, `src/styles/layout.css` |
| 2 | Móvil: «Ver ficha» por debajo del borde en 360×740 | Cabecera y aviso de demo más cortos en móvil, lata más pequeña, insignia en la misma fila que el sabor | `index.html`, `layout.css`, `components.ts` |
| 3 | Pantallas bajas (1280×600, 360×640): acciones fuera de vista | Reglas `max-height: 42rem` que reducen la escala en lugar de recortar | `layout.css` |
| 4 | Ficha abierta por URL: el `h1` aparecía con anillo de foco al cargar | El foco solo se mueve tras navegar dentro de la app | `src/app.ts` |
| 5 | «disponibl/e» partido en tarjetas sin imagen | Texto corto «Sin imagen» en tarjetas; `overflow-wrap: break-word` | `components.ts`, `base.css` |
| 6 | El indicador de estado saltaba de línea en «no verificada» | Texto envuelto y sin saltos | `detail.ts`, `layout.css` |
| 7 | La miniatura sin imagen del selector se anunciaba como imagen, duplicando el nombre | Placeholder decorativo (`aria-hidden`) en miniaturas, igual que `alt=""` | `components.ts` |
| 8 | El contador de resultados se escribía tras un `setTimeout`, lo que movía la página al restaurar la posición | Actualización síncrona | `home.ts` |
| 9 | «DEMO» se salía de la lata ilustrada | `textLength` en el SVG | `scripts/generate-demo-cans.mjs` |
| 10 | Catálogo vacío: halo blanco sin lata | Se oculta la zona visual | `home.ts` |

## 4. Accesibilidad: lo comprobado y lo pendiente

Comprobado (automático o manual):
- Contrastes calculados de los tokens (texto 16,2:1, secundario 8,5:1, bordes de controles ≥ 3,4:1).
- El acento de cada bebida solo se usa como color de texto si supera 4,5:1 sobre el fondo y la superficie. El violeta de demo no lo supera y cae al marfil (prueba unitaria).
- Nombres accesibles, `lang="es"`, títulos por vista, orden de foco y estados activos que no dependen solo del color.
- Objetivos de ≥ 44 px en los controles principales.

**No comprobado** (pendiente de evaluación manual):
- Lectores de pantalla reales (NVDA, VoiceOver, TalkBack): la región `aria-live` de selección y el `role=status` de resultados están implementados pero sin escucharse.
- Zoom real del navegador al 200 % y 400 %: se ha simulado con el ancho de la ventana.
- Firefox y Safari: solo se ha usado Chromium.
- Mantener el foco visible en Windows en modo de alto contraste.
- Rendimiento medido (LCP, CLS) en dispositivos reales. Lo que sí se ha hecho: dimensiones de imagen reservadas, carga diferida fuera de la primera pantalla, `fetchpriority="high"` en la lata principal, y un build de ~7 kB de JS y ~4 kB de CSS (gzip) más ~19 kB de fuente. No se ha medido ninguna métrica.

## 5. Bloqueante vs. opcional

**Bloquea la versión definitiva (no el prototipo):**
- Contrato E01 (D1–D11 en `reconciliacion-e01.md`).
- Bebidas, imágenes autorizadas y datos verificados con fuente (PD-01 a PD-03).

**Mejoras opcionales (no aplicadas, fuera del MVP o sin aprobar):**
- Prueba automatizada del catálogo vacío. Requiere inyectar datos en el build de pruebas; no se ha hecho para no añadir código solo para tests en producción.
- En 320×568 «Ver ficha» queda ~60 px por debajo del borde. Se ha priorizado no encoger más la lata.
- Indicar más claramente que el selector se puede desplazar en escritorio cuando hay muchas bebidas.
- 3D o ambientes más elaborados (ver la nota del §11 de la especificación).

## 6. Alcance respetado

Sin carrito, pagos, cuentas, administración, servidor, API remota, almacenamiento de datos personales, cookies ni recomendaciones de consumo. Sin logotipos ni marcas reales. Aviso de independencia en la cabecera y en el pie.

## 7. Revisión 2026-10-06: catálogo Jeta TNT

- Imágenes reales: recorte con una silueta común (la misma plantilla en las 6 latas), WebP con transparencia, 468×1154, entre 132 y 160 kB cada una. Revisadas sobre fondo de contraste: sin restos del fondo original.
- Defecto corregido: `filter: drop-shadow` sobre las imágenes grandes dibujaba bandas rectangulares en Chromium. Se ha sustituido por una sombra elíptica bajo la lata.
- Defecto corregido: en las tarjetas con etiquetas en dos líneas, el título quedaba desalineado (`grid-template-rows: auto 1fr`).
- Pruebas: 33 unitarias y 64 end-to-end en verde. Las pruebas de «sin resultados» de la interfaz se han retirado porque ese estado ya no se puede alcanzar con una sola marca (ver la reconciliación, §8).

