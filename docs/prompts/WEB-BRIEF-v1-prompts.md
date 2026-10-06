# Energy Showcase — Paquete de prompts para Claude Code

| Campo | Valor |
|---|---|
| Proyecto | `energy-showcase` |
| Nombre | Energy Showcase (provisional) |
| Versión | WEB-BRIEF v1 |
| Estado | **Propuesto.** Nada de este documento está aprobado por el usuario. |
| Rol del autor | Diseñador Web de Prompts. Este documento genera prompts; no contiene diseño ejecutado ni código. |

IDs del brief que se conservan sin cambios: **P01–P03** (pantallas), **F01–F04** (funciones), **E01** (entidad Bebida).
IDs nuevos que introduce este documento: **D01–D16** (decisiones pendientes), **CP01–CP06** (propuestas de cambio), **PR1–PR5** (prompts), **CA-x** (criterios de aceptación por prompt).

---

## Índice

1. [Dirección visual](#1-dirección-visual-propuesta)
2. [Jerarquía, pantallas, componentes y comportamiento por dispositivo](#2-jerarquía-pantallas-componentes-y-dispositivos)
3. [Estados](#3-estados)
4. [MVP, opcional y pendiente](#4-mvp-opcional-y-pendiente)
5. [Propuestas de cambio con impacto](#5-propuestas-de-cambio-no-incorporadas)
6. [Orden de ejecución de los prompts](#6-orden-de-ejecución)
7. [PR1 — Estructura y sistema de diseño](#pr1--estructura-y-sistema-de-diseño)
8. [PR2 — Frontend e interacción](#pr2--frontend-e-interacción)
9. [PR3 — Reconciliación del contrato de datos con Backend](#pr3--reconciliación-del-contrato-de-datos-con-backend)
10. [PR4 — Integración del catálogo](#pr4--integración-del-catálogo)
11. [PR5 — Revisión final y QA](#pr5--revisión-final-y-qa)

---

## 1. Dirección visual (propuesta)

**Concepto: "Escenario de campaña".** Cada bebida ocupa el escenario como si fuera el plano principal de un anuncio: lata enorme, nombre gigante, luz de color y elementos de sabor flotando a su alrededor. Cambiar de bebida es cambiar de anuncio, pero sin cortar la navegación.

### 1.1 Capas del escenario (de atrás hacia delante)

| Capa | Contenido | Función |
|---|---|---|
| 0. Fondo | Negro casi puro (p. ej. `#0A0A0C`) con grano sutil opcional | Base oscura común a todas las bebidas |
| 1. Halo | Gradiente radial con el color principal de la bebida (~25–35 % de opacidad) detrás de la lata | Da a cada bebida su ambiente |
| 2. Tipografía de fondo | Nombre de la bebida en tipografía display gigante (`clamp(4rem, 14vw, 12rem)`), parcialmente tapado por la lata | Contundencia y profundidad |
| 3. Elementos de sabor traseros | 2–3 piezas (cítricos, bayas, hielo, burbujas…) desenfocadas | Profundidad |
| 4. Lata | Imagen recortada (WebP/AVIF con transparencia) de 55–65 % de la altura útil en escritorio y ~50 % en móvil | Protagonista |
| 5. Elementos de sabor delanteros | 1–2 piezas nítidas, más pequeñas | Encuadre de la lata |
| 6. Interfaz | Marca, nombre accesible, chips de sabor, datos clave, botones y selector | Información y control |

Los elementos de sabor se asocian al **perfil de sabor**, no a cada bebida: así un set reducido de gráficos sirve para todo el catálogo y funciona también con placeholders.

### 1.2 Color

- **Tokens globales:** `--bg`, `--surface`, `--text` (cerca de `#F5F5F7`), `--text-muted`, `--focus`.
- **Tokens por bebida:** `--drink-accent` (color principal de E01), `--drink-glow` (derivado, más claro y transparente) y `--drink-on-accent` (negro o blanco, el que dé ≥ 4.5:1).
- **Regla:** el texto pequeño nunca va directamente sobre `--drink-accent` sin comprobar el contraste. El acento se usa en el halo, los bordes, los subrayados, los botones (con `--drink-on-accent`) y la decoración.

### 1.3 Tipografía (propuesta, D07)

- Display condensada y pesada para nombres y titulares (candidatas con licencia libre: Anton, Big Shoulders Display, Archivo Black).
- Sans legible para texto y datos (candidatas: Inter, Manrope).
- Cifras tabulares en la ficha técnica.

### 1.4 Movimiento

| Momento | Comportamiento estándar | Con `prefers-reduced-motion: reduce` |
|---|---|---|
| Cambio de bebida (F01) | ≤ 450 ms en total: sale la lata (fade + desplazamiento ~150 ms), el color del halo transiciona (~400 ms) y entra la lata nueva (scale .96→1, ~250 ms), con textos escalonados 30–40 ms | Cambio instantáneo o fundido ≤ 120 ms, sin desplazamiento ni escala |
| Elementos de sabor | Parallax leve con el puntero (escritorio) o flotación lenta acotada | Estáticos |
| Hover y foco en tarjetas | La lata sube 4 px y aparece un borde de acento | Solo el borde |
| Entrada a la página | Una sola composición de ≤ 600 ms, sin intro ni pantalla de carga artificial | Sin animación |

Reglas: toda animación es **interrumpible** (una nueva selección salta al estado final de la anterior), **nunca bloquea** la entrada del usuario y no hay scroll secuestrado, autoplay de vídeo ni bucles infinitos que distraigan.

### 1.5 Recurso visual proporcionado

- **Recomendado para el MVP:** imágenes 2D de lata recortadas + capas SVG/WebP + transformaciones CSS. Pesa poco, funciona en todos los dispositivos y basta para lograr calidad de campaña.
- **Opcional (D10):** lata 3D girable. Solo si hay modelos con licencia. Debe cargarse de forma diferida y solo en escritorio, y siempre tener como alternativa ligera la imagen 2D. Nunca es requisito del MVP.
- **Opcional ligero:** "pseudo-3D" con 2–3 fotos de la lata (frontal y ¾) que cambian por fundido al pasar el puntero.

---

## 2. Jerarquía, pantallas, componentes y dispositivos

### 2.1 Jerarquía de la primera pantalla (P01)

1. Lata protagonista y nombre gigante, lo primero que se ve.
2. Marca + nombre (encabezado accesible) + chips de perfil de sabor.
3. Microcopy de una línea que explica qué se puede hacer (p. ej. «Elige una bebida para descubrir su sabor o explora el catálogo completo»).
4. Selector de bebidas.
5. Acciones: **Ver ficha** (P03) y **Explorar catálogo** (P02).
6. Datos clave (volumen, cafeína, azúcar) solo si están verificados (F03).

**Requisito de pantalla inicial:** a 360×640 y a 1280×720 se ven sin hacer scroll la lata, el nombre, el selector y el acceso al explorador.

### 2.2 Pantallas

| ID | Pantalla | Contenido | Propuesta de navegación |
|---|---|---|---|
| P01 | Inicio | Escenario, selector, acciones, aviso «sitio no oficial» en el pie | Ruta raíz. La bebida activa puede reflejarse en la URL (`?bebida=id`, CP02) |
| P02 | Explorador | Filtros por marca y por perfil de sabor, contador de resultados, grid de tarjetas, estado sin resultados con «Restablecer filtros» | Sección de la misma página (`#explorar`) con los filtros en la query (CP02) |
| P03 | Detalle | Imagen ampliada, marca, nombre, sabor, descripción, ficha de datos, fuente y estado de verificación, «Volver al catálogo» | Ruta propia `/bebida/:id` (CP01). La alternativa es un panel superpuesto (D08) |

### 2.3 Componentes

| Componente | Responsabilidad | Notas de accesibilidad |
|---|---|---|
| `SiteHeader` | Nombre provisional y enlace a Explorar | Enlace «Saltar al contenido» |
| `Stage` (escenario) | Compone las capas 0–5 a partir de la bebida activa | Las capas decorativas llevan `aria-hidden` |
| `DrinkVisual` | Imagen de lata con fallback a una lata SVG genérica tintada | `alt` desde E01. En el fallback, alt con «Imagen provisional de …» |
| `FlavorLayer` | Elementos de sabor por perfil | Decorativo |
| `DrinkInfo` | Marca, nombre, chips, descripción breve y datos clave | `h1` o `h2` según la página |
| `DrinkSelector` | Cambia la bebida activa (F01) | Grupo de botones con `aria-pressed` o `radiogroup`. ←/→ cuando tiene foco. Anuncio `aria-live="polite"` con el nombre de la nueva bebida |
| `FilterBar` / `FilterChip` | Filtros por marca y sabor (F02) | Chips como `button` con `aria-pressed`. Grupo con nombre accesible |
| `ResultCount` | «N bebidas» | `aria-live="polite"` |
| `CatalogGrid` / `DrinkCard` | Catálogo visual; cada tarjeta enlaza a P03 | Toda la tarjeta es un único enlace, con foco visible |
| `EmptyState` | Sin resultados, catálogo vacío o bebida inexistente | Mensaje y acción clara |
| `FactList` | Volumen, cafeína y azúcar con unidad y base | Se muestra solo si los datos están verificados (F03) |
| `DataStatusBadge` | «Verificado», «Pendiente de verificación» o «Dato de ejemplo» | Texto, no solo color |
| `PlaceholderBadge` | Marca de forma visible imágenes o textos provisionales | Texto, no solo color |
| `SiteFooter` | Aviso de no oficialidad y de que las marcas pertenecen a sus titulares | — |

### 2.4 Comportamiento por dispositivo

| | Móvil (< 640 px) | Tablet (640–1023 px) | Escritorio (≥ 1024 px) |
|---|---|---|---|
| P01 | Apilado: marca y nombre arriba, lata centrada (~50 % de la altura), selector en carrusel horizontal con `scroll-snap` (sin secuestrar el scroll vertical) y acciones en línea | Dos columnas compactas | Grid de 12 columnas: info a la izquierda (5 col), lata en el centro-derecha y selector en fila inferior o columna derecha. Parallax leve |
| P02 | Botón «Filtros (n)» que abre un panel, o fila de chips desplazable. Grid de 2 columnas | Grid de 3 columnas | Barra de filtros visible y grid de 4 columnas |
| P03 | Imagen arriba (~45 vh) y datos debajo | Dos columnas | Imagen *sticky* a la izquierda y datos a la derecha |
| Entrada | Táctil con objetivos ≥ 44×44 px | Táctil o puntero | Puntero + teclado completo. Hover nunca necesario para obtener información |

---

## 3. Estados

| Estado | Dónde | Comportamiento esperado |
|---|---|---|
| Selección activa | P01 selector, P02 filtros | Indicador visible que no depende solo del color (borde + check o subrayado), con `aria-pressed` o `aria-checked` |
| Catálogo vacío | P01 y P02 | Mensaje «Todavía no hay bebidas en el catálogo». El escenario muestra una composición neutra sin lata ni selector, sin errores en consola |
| Filtros sin resultados | P02 | «Ninguna bebida coincide con estos filtros», resumen de los filtros activos y botón **Restablecer filtros**, que devuelve el foco a la barra de filtros |
| Bebida inexistente | P03 (id desconocido en URL), P01 (`?bebida=` inválido) | P03: mensaje «No encontramos esta bebida» con enlace al catálogo, sin pantalla en blanco. P01: se usa la bebida por defecto en silencio |
| Imagen no disponible | Cualquier imagen | Lata SVG genérica tintada con el color de la bebida + `PlaceholderBadge`. Nunca un icono de imagen rota |
| Dato no verificado | `FactList` | El valor no se muestra. Aparece «Pendiente de verificación» |
| Dato provisional | Bebidas de ejemplo | Badge «Dato de ejemplo» visible en la tarjeta y en la ficha |
| Carga | Solo si la carga del catálogo pasa a ser asíncrona | *Skeleton* con la forma del escenario o de las tarjetas, sin spinner a pantalla completa. Con el catálogo local síncrono no se añade |

---

## 4. MVP, opcional y pendiente

### 4.1 Requisitos MVP (del brief)

- P01, P02 y P03 con el flujo inicio → selección o explorador → filtros → detalle → volver conservando los filtros.
- F01: selección coordinada de imagen, textos, color y ambiente.
- F02: filtros por marca y sabor, apertura de fichas y restablecimiento si no hay resultados.
- F03: sabor, volumen, cafeína y azúcar solo si están verificados, con unidades claras.
- F04: móvil, escritorio, teclado y movimiento reducido.
- E01: catálogo local con las operaciones listar, filtrar por marca y sabor, y consultar por id.
- Placeholders identificados. No se inventan datos nutricionales ni afirmaciones de salud o rendimiento.
- Estados de §3.
- Fuera de alcance: carrito, pagos, cuentas, administración, recomendaciones de consumo, Figma y 3D obligatorio.

### 4.2 Propuestas opcionales (no MVP)

- Lata 3D o pseudo-3D (§1.5).
- Grano y parallax del puntero.
- Ordenación del catálogo (alfabética o por marca).
- Comparar dos bebidas lado a lado.
- Compartir enlace de ficha (gratis con CP01 y CP02).
- Modo de alto contraste.

### 4.3 Decisiones pendientes

| ID | Decisión | Quién | Valor por defecto mientras tanto |
|---|---|---|---|
| D01 | Marcas y bebidas del catálogo | Usuario | Bebidas de ejemplo ficticias («Marca Demo A»…) |
| D02 | Origen y licencia de las imágenes | Usuario | Lata SVG genérica |
| D03 | Stack técnico | Usuario (el prompt PR1 propone uno) | El más ligero que cumpla los criterios. Se registra como propuesta |
| D04 | Nombre definitivo del sitio | Usuario | «Energy Showcase» |
| D05 | Taxonomía de perfiles de sabor | Usuario / Backend | Lista provisional (cítrico, frutos rojos, tropical, original, otros) |
| D06 | Base de referencia de cafeína y azúcar (por envase o por 100 ml) | Backend / Usuario | Mostrar siempre la base junto a la unidad |
| D07 | Tipografías definitivas | Usuario | Candidatas de §1.3 |
| D08 | Detalle como ruta propia o como panel | Usuario | Ruta propia (CP01) |
| D09 | Filtros multiselección: OR dentro de un grupo, AND entre grupos | Usuario | Así se implementa |
| D10 | Uso de 3D | Usuario | No |
| D11 | Bebida protagonista inicial: primera, destacada o aleatoria | Usuario | Primera del catálogo, orden estable |
| D12 | Mostrar el texto de advertencia de etiqueta (p. ej. «contenido elevado de cafeína») cuando la fuente verificada lo incluya. No es una recomendación de consumo, pero roza ese límite | Usuario | No mostrar |
| D13 | Hosting y despliegue | Usuario | Build estático local |
| D14 | Forma exacta del contrato E01 | Arquitecto Backend de Prompts | Modelo provisional de PR1 |
| D15 | Orden por defecto del catálogo | Usuario | Por marca y luego por nombre |
| D16 | Objetivo formal de accesibilidad | Usuario | WCAG 2.2 AA como referencia de trabajo |

---

## 5. Propuestas de cambio (no incorporadas)

Ninguna de estas propuestas está aprobada. Los prompts las tratan como **propuesta por defecto, fácilmente reversible**, o las dejan fuera.

| ID | Propuesta | Impacto | Cómo la tratan los prompts |
|---|---|---|---|
| CP01 | P03 como ruta propia (`/bebida/:id`) en lugar de panel | Necesita enrutado en el cliente y *fallback* de rutas en el hosting estático. A cambio, da URL compartible y resuelve con limpieza el caso «bebida inexistente» | Por defecto, aislado en un módulo de rutas |
| CP02 | Filtros y bebida activa en la query de la URL | Cumple «volver conservando filtros» sin estado global frágil y permite compartir. Cambia la forma de las URL | Por defecto |
| CP03 | Añadir a E01 la **base de referencia** de cada medida (envase / 100 ml) | Cambia el contrato de Backend. Sin ella, «unidades claras» es ambiguo para cafeína y azúcar | Campo marcado como *provisional* y llevado a PR3 |
| CP04 | Estado de verificación **por medida** en lugar de por bebida | Cambia el contrato. Permite mostrar el volumen verificado aunque la cafeína esté pendiente | No se implementa. Se lleva a PR3 como pregunta |
| CP05 | Añadir a E01 metadatos de **licencia o origen de la imagen** | Cambia el contrato. Ayuda a cumplir «imágenes propias o autorizadas» | Se lleva a PR3 como pregunta |
| CP06 | Separar `marca` en una entidad propia (id + nombre) | Cambia el contrato. Hace que los filtros por marca sean estables | Provisional en PR1 y llevado a PR3 |

---

## 6. Orden de ejecución

```
PR1 Estructura y sistema de diseño
  └─► PR2 Frontend e interacción
        └─► PR3 Reconciliación del contrato con Backend   ◄── requiere contrato del Arquitecto Backend
              └─► PR4 Integración del catálogo
                    └─► PR5 Revisión final y QA
```

- PR1 y PR2 trabajan con un catálogo **provisional** aislado tras un adaptador.
- PR3 es una **compuerta**: si no existe el contrato de Backend, PR3 entrega un informe de diferencias y preguntas, y **se detiene**. PR4 no empieza sin PR3 completado.
- Cada prompt es autónomo: incluye su contexto, pero da por hecho que el repositorio contiene lo que entregaron los anteriores.

---

## PR1 — Estructura y sistema de diseño

```text
ROL
Eres Claude Code y trabajas como desarrollador frontend con criterio de diseño. Vas a crear la estructura inicial y el sistema de diseño del proyecto "energy-showcase" (nombre provisional: Energy Showcase), según el brief WEB-BRIEF v1, que está en estado PROPUESTO. No afirmes en ningún texto, commit ni documento que el usuario ha aprobado estas decisiones.

CONTEXTO DEL PRODUCTO
- Escaparate interactivo en español de varias marcas de bebidas energéticas. Sin venta directa. El visitante descubre una bebida y consulta sus características.
- Pantallas: P01 Inicio (bebida protagonista, selector, acceso al explorador), P02 Explorador (catálogo con filtros por marca y perfil de sabor; puede ser una sección de la misma página), P03 Detalle (imagen ampliada, descripción de sabor y características disponibles).
- Funciones MVP: F01 seleccionar una bebida actualiza de forma coordinada imagen, textos, color y ambiente. F02 filtrar y abrir fichas, con restablecimiento si no hay resultados. F03 mostrar sabor, volumen, cafeína y azúcar solo con datos verificados y unidades claras. F04 móvil, escritorio, teclado y movimiento reducido.
- Usuario: visitante sin cuenta, solo lectura, sin datos personales.
- Fuera de alcance: carrito, pagos, cuentas, administración, recomendaciones de consumo, Figma y 3D obligatorio.
- No se han elegido marcas, bebidas ni imágenes. No inventes valores nutricionales ni afirmaciones de salud o rendimiento. No uses marcas, logotipos ni latas reales. La web no debe parecer oficial de ninguna marca.

DIRECCIÓN VISUAL ("Escenario de campaña")
- Fondo oscuro común (~#0A0A0C). Cada bebida aporta su color principal, que se convierte en tokens CSS: --drink-accent, --drink-glow (derivado) y --drink-on-accent (negro o blanco, el que dé contraste ≥ 4.5:1).
- Escenario por capas, de atrás hacia delante: fondo, halo radial del color de la bebida, nombre gigante en tipografía display (clamp(4rem, 14vw, 12rem)) parcialmente tapado por la lata, elementos de sabor traseros desenfocados, la lata (55–65 % de la altura útil en escritorio, ~50 % en móvil), elementos de sabor delanteros y, encima, la interfaz.
- Los elementos de sabor se asocian al PERFIL DE SABOR, no a cada bebida. Crea un set mínimo y propio de piezas SVG abstractas (rodaja cítrica, baya, cubo de hielo, burbujas) que no imiten ninguna marca.
- Tipografía: una display condensada y pesada con licencia libre (candidatas: Anton, Big Shoulders Display, Archivo Black) y una sans legible (Inter o Manrope). Cifras tabulares en los datos. Es una propuesta (D07): sírvelas en local o con un único proveedor de fuentes y documéntalo.
- Placeholder de imagen: una lata SVG genérica tintada con --drink-accent, con un PlaceholderBadge visible («Imagen provisional»).

TAREAS
1. Stack (D03, pendiente). Si el repositorio ya tiene stack, úsalo. Si está vacío, elige la opción más ligera que permita: build estático sin servidor, componentes reutilizables, enrutado en el cliente para /bebida/:id y pruebas unitarias básicas. Justifica la elección en docs/DECISIONES.md, marcada como «Propuesta — pendiente de aprobación». No añadas librerías de animación ni 3D: CSS y la Web Animations API bastan.
2. Copia el brief completo y este paquete de decisiones a docs/BRIEF.md: IDs P01–P03, F01–F04, E01, versión WEB-BRIEF v1, estado «propuesto», tabla de decisiones pendientes D01–D16 y propuestas de cambio CP01–CP06.
3. Crea los design tokens: tokens globales (colores, espaciado, radios, tipografía, duraciones y easing de movimiento, breakpoints de 640 y 1024 px) y la función que deriva --drink-glow y --drink-on-accent a partir del color principal, con verificación de contraste.
4. Crea el módulo de catálogo PROVISIONAL detrás de un adaptador. La interfaz solo debe importar el adaptador, nunca los datos en bruto:
   - Operaciones: listarBebidas(), filtrarBebidas({ marcas: string[], sabores: string[] }) con OR dentro de cada grupo y AND entre grupos, y obtenerBebidaPorId(id), que devuelve la bebida o null.
   - Encabeza el archivo con el comentario: «PROVISIONAL — WEB-BRIEF v1 / E01. Pendiente de reconciliar con el contrato del Arquitecto Backend de Prompts (ver PR3).»
   - Forma provisional de E01:
     { id, nombre, marca: { id, nombre }, perfilSabor: string[], descripcion,
       imagen: { src | null, alt }, colorPrincipal (hex),
       volumen | cafeina | azucar: { valor, unidad: "ml"|"mg"|"g", base: "envase"|"100ml" } | null,
       fuente: { nombre, url?, fecha? } | null,
       estadoVerificacion: "verificado" | "pendiente" | "provisional" }
     Los campos marca como objeto (CP06) y base (CP03) son propuestas: márcalos como tales en un comentario.
   - Datos: 6 bebidas de ejemplo de 3 marcas ficticias evidentes («Marca Demo A/B/C», «Bebida Demo 1…6»), con perfiles de sabor variados de la taxonomía provisional (cítrico, frutos rojos, tropical, original, otros). Usa colores distintos y bien diferenciados, descripciones de sabor neutras y sin afirmaciones de salud o rendimiento, imagen.src = null, volumen/cafeina/azucar = null, fuente = null y estadoVerificacion = "provisional". No pongas ningún valor nutricional.
   - Añade fixtures de prueba: catálogo vacío, bebida con imagen rota y bebida "verificado" con valores claramente marcados como FICTICIOS DE PRUEBA, que solo se usen en los tests y nunca en el catálogo que ve el visitante.
5. Maqueta en estático (sin lógica de selección todavía) P01, P02 y P03 con los componentes: SiteHeader, Stage, DrinkVisual, FlavorLayer, DrinkInfo, DrinkSelector, FilterBar, FilterChip, ResultCount, CatalogGrid, DrinkCard, EmptyState, FactList, DataStatusBadge, PlaceholderBadge y SiteFooter (con el aviso «Sitio no oficial. Las marcas mencionadas pertenecen a sus titulares.»).
6. Layout por dispositivo:
   - Móvil (< 640 px): P01 apilado, con el selector en carrusel horizontal con scroll-snap. P02 en 2 columnas, con los filtros en un panel «Filtros (n)» o en una fila de chips desplazable. P03 con la imagen arriba.
   - Tablet: P02 en 3 columnas.
   - Escritorio (≥ 1024 px): P01 en grid de 12 columnas (info a la izquierda, lata en el centro-derecha y selector en fila o en columna). P02 en 4 columnas. P03 en 2 columnas con la imagen sticky.
7. HTML semántico: un único h1 por vista, landmarks, enlace «Saltar al contenido», lang="es" y las capas decorativas con aria-hidden.

NO HAGAS
- No implementes todavía la interacción de selección, los filtros funcionales, el enrutado ni las animaciones de transición (son de PR2).
- No uses datos, nombres ni imágenes reales de marcas. No añadas servidor, API remota, analítica ni cookies.

RESULTADO ESPERADO
- Un proyecto que arranca y compila. docs/BRIEF.md y docs/DECISIONES.md creados. Tokens, adaptador de catálogo provisional con fixtures, componentes estáticos y las tres vistas maquetadas con datos de ejemplo.
- Un resumen final con: stack propuesto y su justificación, estructura de carpetas, decisiones tomadas por defecto (con su ID D/CP) y lo que queda para PR2.

CRITERIOS DE ACEPTACIÓN (CA-1)
- CA-1.1 A 360×640 y a 1280×720 se ven, sin hacer scroll en P01, la lata (o el placeholder), el nombre, el selector y el acceso al explorador.
- CA-1.2 Todo texto sobre fondo o acento cumple un contraste ≥ 4.5:1 (o ≥ 3:1 si es texto grande). Hay un test que lo comprueba con los colores del catálogo provisional.
- CA-1.3 Toda bebida de ejemplo y toda imagen placeholder muestran un badge visible en texto («Dato de ejemplo», «Imagen provisional»).
- CA-1.4 No aparece ningún valor de cafeína, azúcar ni volumen en la interfaz. La FactList muestra «Pendiente de verificación».
- CA-1.5 La interfaz no importa los datos en bruto: solo usa el adaptador. El archivo provisional lleva su comentario de cabecera.
- CA-1.6 Sin errores en consola. Los tests del adaptador (listar, filtrar OR/AND, id inexistente → null, catálogo vacío) pasan.
- CA-1.7 Ningún documento afirma que el usuario haya aprobado decisiones.
```

---

## PR2 — Frontend e interacción

```text
ROL
Eres Claude Code y trabajas como desarrollador frontend especializado en interacción y accesibilidad. Proyecto: "energy-showcase" (Energy Showcase, nombre provisional), brief WEB-BRIEF v1, estado PROPUESTO. No afirmes en ningún lugar que el usuario ha aprobado decisiones.

DEPENDENCIAS
- PR1 completado: existen docs/BRIEF.md, docs/DECISIONES.md, los tokens, el adaptador de catálogo PROVISIONAL (listarBebidas, filtrarBebidas, obtenerBebidaPorId) y los componentes estáticos de P01, P02 y P03.
- Lee primero docs/BRIEF.md y docs/DECISIONES.md. Si no existen, detente e informa de que falta PR1.

CONTEXTO RELEVANTE
- Flujo: inicio → selección o explorador → filtros → detalle → volver conservando los filtros.
- F01: seleccionar una bebida actualiza de forma coordinada imagen, nombre, marca, chips, descripción, color (tokens --drink-*), halo y elementos de sabor.
- F02: filtrar por marca y perfil de sabor, abrir fichas y restablecer los filtros cuando no hay resultados.
- F04: móvil, escritorio, teclado completo y prefers-reduced-motion.
- Siguen vigentes estas reglas: no inventar datos nutricionales, mostrar los placeholders identificados y no usar marcas reales.

TAREAS
1. Selección coordinada (F01) en P01:
   - Una única fuente de verdad para la bebida activa. Todas las capas leen de ella.
   - DrinkSelector: grupo de botones con aria-pressed (o radiogroup con aria-checked). Navegación ←/→ e Inicio/Fin cuando el grupo tiene foco. Indicador de selección que no dependa solo del color.
   - Una región aria-live="polite" anuncia «Bebida seleccionada: {nombre} de {marca}».
   - Bebida inicial (D11, pendiente): la primera del catálogo en orden estable. Si la URL trae ?bebida={id} válido, esa. Si es inválido, se ignora en silencio.
2. Transición de cambio (≤ 450 ms en total): sale la lata (fade + desplazamiento ~150 ms), el color del halo transiciona (~400 ms; usa @property para interpolar el color si el navegador lo soporta y, si no, un fundido) y entra la lata (scale .96→1, ~250 ms), con textos escalonados 30–40 ms.
   - Interrumpible: si llega una selección nueva durante la transición, se cancela la anterior y se pasa al estado final nuevo. El selector nunca se desactiva durante la animación.
   - Con prefers-reduced-motion: reduce: sin desplazamiento, escala ni parallax; el cambio es instantáneo o con un fundido ≤ 120 ms. La experiencia tiene que estar completa, con toda la información y todos los controles.
   - Parallax leve de los elementos de sabor con el puntero, solo en escritorio, con puntero fino y sin movimiento reducido.
3. Explorador (P02, F02):
   - Chips de marca y de sabor generados desde el catálogo. Combinación OR dentro de un grupo y AND entre grupos (D09, pendiente). Chips con aria-pressed.
   - ResultCount con aria-live="polite".
   - Si no hay resultados: EmptyState «Ninguna bebida coincide con estos filtros», un resumen de los filtros activos y el botón «Restablecer filtros», que limpia los filtros y devuelve el foco al primer chip.
   - Si el catálogo está vacío: EmptyState «Todavía no hay bebidas en el catálogo», sin filtros visibles.
   - Los filtros se guardan en la query de la URL (CP02, propuesta), p. ej. ?marca=demo-a,demo-b&sabor=citrico.
4. Detalle (P03) y navegación (CP01, propuesta):
   - Ruta /bebida/:id. Al entrar, el foco va al h1 y el título del documento se actualiza.
   - Id inexistente: EmptyState «No encontramos esta bebida» con enlace al catálogo. Nunca una pantalla en blanco.
   - «Volver al catálogo»: si se llegó desde P02, vuelve con los mismos filtros y la posición de la tarjeta de origen (foco en ella). Si se llegó por enlace directo, va a P02 sin filtros.
   - Configura el fallback de rutas para el hosting estático o documenta la alternativa (hash routing) en DECISIONES.md.
5. Imagen no disponible: si imagen.src es null o la carga falla (onerror), DrinkVisual muestra la lata SVG genérica tintada + «Imagen provisional», sin parpadeo de icono roto.
6. Teclado y foco: todo el flujo se puede recorrer solo con teclado. Foco visible (≥ 3 px, contraste ≥ 3:1). Sin trampas de foco. Si hay panel de filtros en móvil, gestiona el foco al abrir y al cerrar, y cierra con Escape.
7. Táctil: objetivos ≥ 44×44 px. El carrusel del selector usa scroll-snap nativo y no secuestra el scroll vertical.

NO HAGAS
- No cambies la forma del modelo E01 ni conectes ningún origen de datos que no sea el adaptador provisional: la reconciliación es de PR3.
- No añadas 3D, vídeo, intros, pantallas de carga artificiales ni scroll secuestrado.

RESULTADO ESPERADO
- Flujo completo funcional con el catálogo provisional. Tests de interacción para: selección y anuncio, filtros OR/AND, sin resultados → restablecer, volver conservando filtros, id inexistente, imagen rota y modo de movimiento reducido.
- docs/DECISIONES.md actualizado con las decisiones por defecto aplicadas (CP01, CP02, D09, D11), todas como «propuesta».
- Un resumen final con lo hecho, lo pendiente y los riesgos.

CRITERIOS DE ACEPTACIÓN (CA-2)
- CA-2.1 Al seleccionar otra bebida cambian a la vez imagen, textos, color, halo y elementos de sabor, sin quedar ninguna capa desincronizada aunque se pulse rápido 5 veces seguidas.
- CA-2.2 La transición dura ≤ 450 ms y no bloquea la entrada. Con movimiento reducido no hay desplazamiento ni escala y toda la información sigue disponible.
- CA-2.3 Filtrar, abrir una ficha y volver conserva exactamente los filtros y devuelve el foco a la tarjeta de origen.
- CA-2.4 «Restablecer filtros» aparece solo cuando no hay resultados (o también siempre que haya filtros activos, si así se documenta) y devuelve el catálogo completo.
- CA-2.5 /bebida/id-que-no-existe muestra el estado de «bebida inexistente» con salida al catálogo.
- CA-2.6 El recorrido completo se hace solo con teclado y los cambios se anuncian a lectores de pantalla.
- CA-2.7 Sin errores en consola. Los tests pasan.
```

---

## PR3 — Reconciliación del contrato de datos con Backend

```text
ROL
Eres Claude Code y actúas como integrador de contratos entre frontend y backend. Proyecto: "energy-showcase", brief WEB-BRIEF v1, estado PROPUESTO. Esta etapa es una COMPUERTA: decide si el frontend puede integrarse con el contrato oficial de datos.

DEPENDENCIAS
- PR1 y PR2 completados (el adaptador de catálogo PROVISIONAL existe y la interfaz lo consume).
- El contrato de datos de E01 lo define el Arquitecto Backend de Prompts. Búscalo en el repositorio (p. ej. docs/contracts/, docs/backend/, schemas/ o un archivo que mencione E01) o pide al usuario su ubicación.
- SI NO ENCUENTRAS EL CONTRATO: no lo inventes ni lo «completes». Entrega solo el informe de los pasos 1 y 4 (forma provisional + preguntas abiertas), márcalo como «BLOQUEADO — falta contrato de Backend» y detente sin modificar código.

CONTEXTO
- E01 Bebida, según el brief: id, nombre, marca, perfil de sabor, descripción, imagen, texto alternativo, color principal, volumen, cafeína y azúcar con unidades, fuente y estado de verificación.
- Operaciones requeridas: listar, filtrar por marca/sabor y consultar por id. El MVP usa un catálogo local, sin servidor ni API remota.
- F03: sabor, volumen, cafeína y azúcar solo se muestran si están verificados y con unidades claras.
- Propuestas de cambio abiertas que afectan al contrato (no aprobadas): CP03 base de referencia por medida (envase/100 ml), CP04 estado de verificación por medida, CP05 licencia/origen de imagen, CP06 marca como entidad con id.

TAREAS
1. Inventario de la forma PROVISIONAL actual: campos, tipos, nulabilidad, enumeraciones y operaciones del adaptador, con referencia a los archivos.
2. Tabla de correspondencia campo a campo, PROVISIONAL ↔ CONTRATO, con las columnas: campo provisional | campo del contrato | tipo y nulabilidad (en ambos) | diferencia | acción en el frontend | riesgo.
   Cubre como mínimo: identificador y su formato apto para URL, marca (texto o entidad), perfil de sabor (taxonomía y si es lista), imagen y texto alternativo, color principal (formato), unidades y base de referencia de volumen/cafeína/azúcar, fuente, valores del estado de verificación y su granularidad (por bebida o por medida), y semántica de los filtros (OR/AND, mayúsculas, ids o nombres).
3. Operaciones: compara listar, filtrar y consultar por id (firma, retorno, comportamiento ante id inexistente y catálogo vacío, orden).
4. Preguntas abiertas para el Arquitecto Backend y el usuario, cada una con su ID (CP03–CP06, D05, D06, D14 u otras nuevas numeradas como Q01…) y el impacto de cada respuesta.
5. Si el contrato existe y no tiene bloqueos: crea un plan de migración del adaptador en docs/RECONCILIACION-E01.md (pasos, archivos afectados, tests que hay que actualizar). Ajusta SOLO la capa del adaptador y los tipos para que la interfaz no cambie, o lista los cambios mínimos de interfaz si son inevitables.
6. Actualiza docs/DECISIONES.md: las decisiones que fija el contrato se registran como «Definido por contrato Backend vX» (cita la versión) y no como aprobación del usuario.

NO HAGAS
- No modifiques el contrato de Backend ni lo reinterpretes. Las discrepancias se documentan como preguntas.
- No conviertas datos provisionales en verificados. No añadas valores nutricionales.
- No incorpores CP03–CP06 como aprobadas, salvo que el contrato ya las incluya.

RESULTADO ESPERADO
- docs/RECONCILIACION-E01.md con: estado (BLOQUEADO / LISTO CON CAMBIOS / LISTO), inventario, tabla de correspondencia, comparación de operaciones, preguntas abiertas y plan de migración.
- Si el estado es LISTO o LISTO CON CAMBIOS: adaptador y tipos ajustados con los tests en verde.

CRITERIOS DE ACEPTACIÓN (CA-3)
- CA-3.1 Cada campo de E01 del brief aparece en la tabla, con el campo del contrato correspondiente o con «sin equivalente» y una pregunta asociada.
- CA-3.2 Queda establecido de forma explícita cómo se expresan las unidades y la base de cafeína y azúcar, o queda como pregunta bloqueante.
- CA-3.3 Queda definido qué valor del contrato significa «verificado» y cómo lo usa F03.
- CA-3.4 Si el contrato falta, el estado es BLOQUEADO y no se ha modificado código.
- CA-3.5 La interfaz sigue consumiendo solo el adaptador. Los tests pasan.
- CA-3.6 Ninguna decisión se presenta como aprobada por el usuario.
```

---

## PR4 — Integración del catálogo

```text
ROL
Eres Claude Code y actúas como desarrollador frontend que integra los datos. Proyecto: "energy-showcase", brief WEB-BRIEF v1, estado PROPUESTO.

DEPENDENCIAS
- PR3 completado con estado LISTO o LISTO CON CAMBIOS en docs/RECONCILIACION-E01.md. Si el estado es BLOQUEADO o el documento no existe, detente e informa.
- Contrato de E01 del Arquitecto Backend disponible en el repositorio.

CONTEXTO
- El MVP usa un catálogo LOCAL (archivo de datos en el repositorio), sin servidor ni API remota.
- F03: mostrar sabor, volumen, cafeína y azúcar SOLO cuando estén verificados, con unidades claras.
- Las marcas, bebidas e imágenes definitivas no están elegidas (D01, D02). Puede que el catálogo real siga vacío o solo contenga entradas provisionales.
- No inventes valores nutricionales ni afirmaciones de salud o rendimiento. Usa solo imágenes propias o autorizadas. La web no debe parecer oficial de ninguna marca.

TAREAS
1. Crea el catálogo local con la forma exacta del contrato. Si el usuario ha aportado datos, cárgalos tal cual. Si no, migra las bebidas de ejemplo a la nueva forma, conservando su marca de provisionalidad.
2. Validación al cargar: comprueba cada entrada contra el contrato (campos requeridos, tipos, unidades permitidas, id único y apto para URL, color válido). Descarta las entradas inválidas avisando en la consola en desarrollo y nunca rompas la página. Añade un test que valide el catálogo completo.
3. Reglas de presentación (F03), en una única función pura y testeada:
   - Solo si el estado es verificado: muestra el valor con su unidad y su base (p. ej. «80 mg por envase», «11 g / 100 ml»), con formato numérico es-ES (coma decimal).
   - Si no está verificado o es null: «Pendiente de verificación», sin cifra.
   - Si es provisional: badge «Dato de ejemplo» en la tarjeta y en la ficha.
   - Fuente: si hay datos verificados, muestra el nombre de la fuente (y su enlace y fecha, si existen) en la ficha.
4. Imágenes: usa formatos modernos con tamaños responsivos (srcset/sizes), carga diferida en el catálogo, prioridad alta para la lata protagonista de P01, alt desde el contrato y fallback a la lata SVG genérica + «Imagen provisional».
5. Revisa los cuatro estados con datos reales y con fixtures: catálogo vacío, filtros sin resultados, bebida inexistente e imagen no disponible. Añade un estado de carga SOLO si la carga de datos es asíncrona (skeleton con la forma del escenario o de las tarjetas).
6. Filtros: genera las opciones de marca y sabor desde los datos con la semántica que fije el contrato. Si el contrato cambia la semántica de PR2, ajústala y actualiza los tests.
7. Elimina el módulo PROVISIONAL o déjalo solo como fixture de tests, y sin ninguna referencia desde el código de producción.

NO HAGAS
- No cambies estados de verificación ni completes campos que falten. No añadas marcas reales sin datos aportados por el usuario.
- No añadas servidor, API remota, analítica ni recomendaciones de consumo.

RESULTADO ESPERADO
- Catálogo local conforme al contrato, validación, reglas de presentación de F03 testeadas, imágenes optimizadas y estados verificados.
- Un resumen con: número de entradas cargadas, descartadas y provisionales, y los campos sin verificar.

CRITERIOS DE ACEPTACIÓN (CA-4)
- CA-4.1 Ningún valor de volumen, cafeína ni azúcar aparece en la interfaz si su estado no es «verificado».
- CA-4.2 Todo valor mostrado lleva su unidad y su base, y sigue el formato es-ES.
- CA-4.3 Los datos provisionales se distinguen de forma visible y en texto de los verificados, en la tarjeta y en la ficha.
- CA-4.4 Una entrada inválida no rompe la página. El test de validación del catálogo pasa.
- CA-4.5 El código de producción no importa ningún dato provisional.
- CA-4.6 Los cuatro estados funcionan con los datos integrados.
```

---

## PR5 — Revisión final y QA

```text
ROL
Eres Claude Code y actúas como revisor de calidad (diseño, accesibilidad, rendimiento y cumplimiento del brief). Proyecto: "energy-showcase", brief WEB-BRIEF v1, estado PROPUESTO. No afirmes que el usuario ha aprobado nada.

DEPENDENCIAS
- PR1–PR4 completados. Lee docs/BRIEF.md, docs/DECISIONES.md y docs/RECONCILIACION-E01.md.

TAREAS
1. Revisión contra el brief: recorre P01–P03, F01–F04 y E01 y comprueba el flujo completo: inicio → selección o explorador → filtros → detalle → volver conservando filtros.
2. Revisión visual con capturas a 360×640, 390×844, 768×1024, 1280×720 y 1440×900, en modo estándar y con movimiento reducido (por ejemplo, con Playwright y emulación de prefers-reduced-motion). Comprueba:
   - La lata protagonista domina en P01 y se ven sin scroll la lata, el nombre, el selector y el acceso al explorador.
   - Coherencia de color entre halo, acentos, tarjetas y ficha para cada bebida.
   - Sin solapamientos ni texto cortado, y sin scroll horizontal.
3. Accesibilidad (referencia WCAG 2.2 AA, D16): auditoría automática (p. ej. axe) sin errores críticos ni graves, además de una revisión manual del recorrido con teclado, el orden y la visibilidad del foco, los anuncios aria-live, los nombres accesibles de chips y selector, los alt, el contraste de texto sobre cada --drink-accent, los objetivos táctiles ≥ 44 px y el zoom al 200 % sin pérdida de contenido.
4. Movimiento: duración ≤ 450 ms en el cambio de bebida, transiciones interrumpibles y sin bloqueo de la entrada. Con movimiento reducido la experiencia está completa.
5. Rendimiento (objetivos propuestos, no aprobados): LCP < 2,5 s y CLS < 0,1 en móvil medio simulado, imagen protagonista priorizada, sin JavaScript ni librerías innecesarias.
6. Contenido y legal: no aparecen valores nutricionales sin verificar, afirmaciones de salud o rendimiento, recomendaciones de consumo ni elementos que hagan parecer oficial la web. El aviso de no oficialidad está presente y los placeholders están identificados.
7. Clasifica cada hallazgo como Bloqueante, Mayor o Menor. Corrige los Bloqueantes y los Mayores que estén dentro del alcance, sin añadir funciones nuevas. Los Menores y los opcionales solo se documentan.

RESULTADO ESPERADO
- docs/QA-WEB-BRIEF-v1.md con: una tabla de criterios de aceptación (cumple / no cumple / no aplica + evidencia), capturas o referencias, hallazgos clasificados, correcciones aplicadas, opcionales sugeridos (sección 4.2 del paquete) y la lista de decisiones que siguen pendientes (D01–D16, CP01–CP06).

CRITERIOS DE ACEPTACIÓN (CA-5) — los del brief
- CA-5.1 La bebida protagonista destaca de inmediato.
- CA-5.2 Explorar y consultar fichas es fácil: se llega a cualquier ficha en ≤ 3 interacciones desde P01.
- CA-5.3 La selección mantiene la coherencia visual.
- CA-5.4 Móvil conserva la calidad: misma jerarquía, sin recortes y con la lata protagonista.
- CA-5.5 Textos y controles son accesibles (sin errores críticos ni graves en la auditoría automática y con el recorrido por teclado completo).
- CA-5.6 Con movimiento reducido la experiencia está completa.
- CA-5.7 Los datos provisionales se distinguen de los verificados.
- CA-5.8 Sin carrito, pagos, cuentas, administración ni recomendaciones de consumo.
```
