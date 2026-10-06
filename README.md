# Energy Showcase (provisional)

Escaparate interactivo e independiente de bebidas energéticas, en español. Solo lectura y sin venta. Contrato **WEB-BRIEF v1**, en estado **propuesto** (nada está aprobado).

> Catálogo: 6 bebidas de **Jeta TNT** con imágenes aportadas por el usuario. Las descripciones, algunos sabores y todas las características están **pendientes de confirmar**: no se publica ninguna cifra. Ver los pendientes en `docs/`.

## Uso

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # build estático en dist/ (rutas relativas)
npm run check      # tipos + pruebas unitarias + build + pruebas end-to-end
npm run build:artifact  # versión de un solo archivo en dist-artifact/
```

Para regenerar las latas: guarda los originales (1254×1254) en `assets-src/jeta-tnt/` con los nombres de `scripts/cutout-cans.py` y ejecuta `python3 scripts/cutout-cans.py assets-src/jeta-tnt src/assets/cans`. Los originales no se versionan.

Las pruebas end-to-end usan el Chromium de `PW_CHROMIUM_PATH` (por defecto `/opt/pw-browsers/chromium`).

## Estructura

```
src/data/       contrato provisional E01, catálogo Jeta TNT y capa de acceso
src/domain/     reglas puras: características verificadas, contraste, navegación
src/ui/         vistas DOM: inicio (P01 + P02) y detalle (P03)
src/styles/     tokens de diseño y maquetación
tests/          unitarias (Vitest) y end-to-end + accesibilidad (Playwright + axe)
scripts/        recorte de latas (cutout-cans.py) y build de un solo archivo (build-artifact.mjs)
docs/           especificación, stack, reconciliación E01 y revisión
```

URLs: `?marca=<slug>&sabor=<clave>` (inicio con filtros) y `?bebida=<id>` (ficha, conserva los filtros).

## Documentación

1. [`docs/especificacion-diseno.md`](docs/especificacion-diseno.md): estructura y diseño (etapa 1)
2. [`docs/decisiones-stack.md`](docs/decisiones-stack.md): elección de tecnología (etapa 2)
3. [`docs/reconciliacion-e01.md`](docs/reconciliacion-e01.md): contrato E01, bloqueado hasta recibir el del backend (etapa 3)
4. [`docs/revision.md`](docs/revision.md): revisión y evidencias (etapa 4)
