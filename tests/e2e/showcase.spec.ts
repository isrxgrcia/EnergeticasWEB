import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const consoleErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
});

test.afterEach(async ({ page }) => {
  expect(consoleErrors.get(page), 'sin errores de consola').toEqual([]);
});

const hero = (page: Page) => page.locator('.showcase');
const heroImage = (page: Page) => page.locator('.showcase__stage .can img');
const selectorOption = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Elegir bebida' }).getByRole('button', { name });

test.describe('P01 inicio', () => {
  test('propósito y acciones visibles en la primera pantalla', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Descubre bebidas/);
    await expect(page.locator('#hero-ver-ficha')).toBeInViewport();
    await expect(page.locator('#hero-ver-ficha')).toHaveAccessibleName('Ver ficha de Demo Cítrica');
    await expect(hero(page).getByRole('link', { name: 'Explorar bebidas' })).toBeInViewport();
    await expect(heroImage(page)).toBeInViewport();
    await expect(page.getByText('Contenido de demostración:')).toBeVisible();
  });

  test('F01: selecciones rápidas terminan coherentes en la última', async ({ page }) => {
    await page.goto('/');
    for (const name of ['Demo Bosque Rojo', 'Demo Tropical', 'Demo Original', 'Demo Menta Glaciar', 'Demo Tropical']) {
      await selectorOption(page, name).click({ delay: 0 });
    }
    const h = hero(page);
    await expect(h).toHaveAttribute('data-drink-id', 'demo-tropical');
    await expect(h.locator('.drink-name')).toHaveText('Demo Tropical');
    await expect(heroImage(page)).toHaveAttribute('alt', /Demo Tropical/);
    const expectedSrc = await page.locator('[data-drink-id="demo-tropical"].card img').getAttribute('src');
    await expect(heroImage(page)).toHaveAttribute('src', expectedSrc!);
    await expect(h.locator('#hero-ver-ficha')).toHaveAttribute('href', /bebida=demo-tropical/);
    await expect(h).toHaveAttribute('style', /--accent:#FF8A1F/);
    await expect(page.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(selectorOption(page, 'Demo Tropical')).toHaveAttribute('aria-pressed', 'true');
  });

  test('F01 sin imagen: placeholder conserva nombre y geometría', async ({ page }) => {
    await page.goto('/');
    await selectorOption(page, 'Demo Uva Nocturna').click();
    const ph = hero(page).getByRole('img', { name: 'Imagen no disponible de «Demo Uva Nocturna»' });
    await expect(ph).toBeVisible();
    const box = await page.locator('.showcase__stage .can').boundingBox();
    expect(box!.height).toBeGreaterThan(100);
  });

  test('F04: teclado selecciona sin mover el foco', async ({ page }) => {
    await page.goto('/');
    const option = selectorOption(page, 'Demo Original');
    await option.focus();
    await page.keyboard.press('Enter');
    await expect(option).toBeFocused();
    await expect(hero(page).locator('.drink-name')).toHaveText('Demo Original');
    await page.keyboard.press('Space');
    await expect(option).toHaveAttribute('aria-pressed', 'true');
  });

  test('F04: movimiento reducido aplica cambios inmediatos', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await selectorOption(page, 'Demo Bosque Rojo').click();
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
    await expect(hero(page).locator('.drink-name')).toHaveText('Demo Bosque Rojo');
  });

  test('imagen fallida muestra placeholder identificado', async ({ page }) => {
    await page.goto('/');
    // Las imágenes de demo van incrustadas; se simula el fallo de carga.
    await heroImage(page).dispatchEvent('error');
    await expect(hero(page).getByRole('img', { name: 'Imagen no disponible de «Demo Cítrica»' })).toBeVisible();
    await expect(page.locator('.showcase__stage .can')).toHaveAttribute('data-image-state', 'error');
  });

  test('la navegación funciona aunque el historial del navegador esté bloqueado', async ({ page }) => {
    await page.addInitScript(() => {
      const deny = () => {
        throw new DOMException('bloqueado', 'SecurityError');
      };
      history.pushState = deny;
      history.replaceState = deny;
    });
    await page.goto('/');
    await page.getByLabel('Sabor', { exact: true }).selectOption({ label: 'Mentolado' });
    await page.locator('#tarjeta-demo-menta-glaciar').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Demo Menta Glaciar' })).toBeFocused();
    await page.getByRole('link', { name: '← Volver al catálogo' }).click();
    await expect(page.getByLabel('Sabor', { exact: true })).toHaveValue('menta');
    await expect(page.locator('#tarjeta-demo-menta-glaciar')).toBeFocused();
  });
});

test.describe('P02 explorador', () => {
  test('“Explorar bebidas” lleva al explorador y mueve el foco', async ({ page }) => {
    await page.goto('/');
    await hero(page).getByRole('link', { name: 'Explorar bebidas' }).click();
    await expect(page.getByRole('heading', { name: 'Explorar bebidas' })).toBeFocused();
  });

  test('F02: filtros combinados, ficha y vuelta conservando filtros, posición y foco', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Marca', { exact: true }).selectOption({ label: 'Marca Demo A' });
    await page.getByLabel('Sabor', { exact: true }).selectOption({ label: 'Cítrico' });
    await expect(page).toHaveURL(/marca=marca-demo-a&sabor=citrico/);
    await expect(page.getByRole('status')).toHaveText('2 bebidas · Marca Demo A · Cítrico');
    await expect(page.locator('.catalog > li')).toHaveCount(2);

    const link = page.getByRole('link', { name: 'Ver ficha de Demo Tropical' }).last();
    await link.scrollIntoViewIfNeeded();
    const topBefore = await link.evaluate((el) => el.getBoundingClientRect().top);
    await link.click();

    await expect(page).toHaveURL(/bebida=demo-tropical/);
    await expect(page.getByRole('heading', { level: 1, name: 'Demo Tropical' })).toBeFocused();
    await expect(page).toHaveTitle('Demo Tropical — Energy Showcase');
    await page.getByRole('link', { name: '← Volver al catálogo' }).click();

    await expect(page).toHaveURL(/\?marca=marca-demo-a&sabor=citrico$/);
    await expect(page.getByLabel('Marca', { exact: true })).toHaveValue('marca-demo-a');
    await expect(page.getByLabel('Sabor', { exact: true })).toHaveValue('citrico');
    await expect(page.locator('.catalog > li')).toHaveCount(2);
    await expect(page.locator('#tarjeta-demo-tropical')).toBeFocused();
    const topAfter = await page.locator('#tarjeta-demo-tropical').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(topAfter - topBefore)).toBeLessThan(2);
  });

  test('F02: botón Atrás del navegador también conserva filtros', async ({ page }) => {
    await page.goto('/?sabor=menta');
    await page.locator('#tarjeta-demo-menta-glaciar').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Demo Menta Glaciar' })).toBeVisible();
    await page.goBack();
    await expect(page.getByLabel('Sabor', { exact: true })).toHaveValue('menta');
    await expect(page.locator('.catalog > li')).toHaveCount(1);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1, name: 'Demo Menta Glaciar' })).toBeVisible();
  });

  test('F02: cero resultados ofrece restablecer', async ({ page }) => {
    await page.goto('/?marca=marca-demo-c&sabor=citrico');
    await expect(page.getByRole('status')).toHaveText(/^0 bebidas/);
    await expect(page.locator('[data-state="no-results"]')).toContainText('Ninguna bebida coincide');
    await page.locator('[data-state="no-results"]').getByRole('button', { name: 'Restablecer filtros' }).click();
    await expect(page.locator('.catalog > li')).toHaveCount(6);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel('Marca', { exact: true })).toBeFocused();
  });

  test('parámetros de filtro desconocidos se ignoran', async ({ page }) => {
    await page.goto('/?marca=inventada&sabor=xx');
    await expect(page.locator('.catalog > li')).toHaveCount(6);
  });
});

test.describe('P03 detalle', () => {
  test('F03: sin cifras inventadas; pendiente/no verificada visibles', async ({ page }) => {
    await page.goto('/?bebida=demo-bosque-rojo');
    const features = page.locator('.features');
    await expect(features.locator('[data-feature="volume"] dd')).toHaveText('Información no verificada');
    await expect(features.locator('[data-feature="sugar"] dd')).toHaveText('Información pendiente');
    await expect(features).not.toContainText(/\d/);
    await expect(page.getByText('Contenido de demostración', { exact: true })).toBeVisible();
    await expect(page.getByText('No hay fuentes registradas')).toBeVisible();
  });

  test('URL directa y vuelta al catálogo', async ({ page }) => {
    await page.goto('/?bebida=demo-original&sabor=original');
    await page.getByRole('link', { name: '← Ver el catálogo' }).click();
    await expect(page.getByLabel('Sabor', { exact: true })).toHaveValue('original');
    await expect(page.getByRole('heading', { name: 'Explorar bebidas' })).toBeFocused();
  });

  test('“Ver ficha” desde el inicio vuelve al inicio con la misma selección', async ({ page }) => {
    await page.goto('/');
    await selectorOption(page, 'Demo Original').click();
    await page.locator('#hero-ver-ficha').click();
    await page.getByRole('link', { name: '← Volver al inicio' }).click();
    await expect(hero(page).locator('.drink-name')).toHaveText('Demo Original');
    await expect(page.locator('#hero-ver-ficha')).toBeFocused();
  });

  test('id inexistente tiene recuperación', async ({ page }) => {
    await page.goto('/?bebida=no-existe');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('No encontramos esta bebida');
    await expect(page).toHaveTitle('Bebida no encontrada — Energy Showcase');
    await page.getByRole('link', { name: 'Ver todas las bebidas' }).click();
    await expect(page.locator('.catalog > li')).toHaveCount(6);
  });
});

test.describe('adaptable (F04)', () => {
  const sizes: [string, number, number][] = [
    ['móvil estrecho', 320, 640],
    ['móvil', 360, 740],
    ['móvil grande', 414, 896],
    ['tablet', 768, 1024],
    ['escritorio', 1280, 800],
    ['escritorio ancho', 1920, 1080],
    ['pantalla baja', 1280, 600],
    ['zoom 200 % de 1280', 640, 400],
  ];
  for (const [label, width, height] of sizes) {
    test(`sin desbordamiento horizontal: ${label} (${width}×${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const url of ['/', '/?bebida=demo-menta-glaciar', '/?bebida=no-existe', '/?marca=marca-demo-c&sabor=citrico']) {
        await page.goto(url);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, url).toBeLessThanOrEqual(0);
      }
    });
  }

  for (const [width, height] of [[360, 640], [1280, 600]] as const) {
    test(`acciones en la primera pantalla a ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('#hero-ver-ficha')).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.showcase__stage .can img')).toBeInViewport();
    });
  }

  test('catálogo en una columna a 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const xs = await page.locator('.catalog > li').evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size);
    expect(xs).toBe(1);
  });
});

test.describe('accesibilidad automatizada (axe, WCAG 2.2 A/AA)', () => {
  for (const url of ['/', '/?bebida=demo-tropical', '/?bebida=no-existe', '/?marca=marca-demo-c&sabor=citrico', '/?sabor=uva']) {
    test(`sin infracciones detectables: ${url}`, async ({ page }) => {
      await page.goto(url);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    });
  }
});
