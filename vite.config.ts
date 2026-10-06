import { defineConfig } from 'vitest/config';

// SINGLE_FILE=1 incrusta fuentes e imágenes como data URI (ver scripts/build-artifact.mjs).
const singleFile = process.env.SINGLE_FILE === '1';

export default defineConfig({
  // Rutas relativas: el build funciona en cualquier alojamiento estático.
  base: './',
  build: singleFile ? { outDir: 'dist-artifact', assetsInlineLimit: Number.MAX_SAFE_INTEGER, cssCodeSplit: false } : {},
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
