import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Rutas relativas: el build funciona en cualquier alojamiento estático.
  base: './',
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
