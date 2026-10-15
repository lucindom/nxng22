/**
 * FUENTE DE VERDAD de los colores del design system.
 *
 * Equivale a `themes` + `material-palettes` + `fuse.customProps` de ems22
 * (`libs/client/shared/tailwind-preset/tailwind.config.js` y `fusev2/.../plugins/theming.js`).
 *
 * Este archivo no lo lee ni Tailwind ni Angular: lo lee `tools/scripts/generate-themes.mjs`
 * (`npm run themes`), que escribe los CSS de `libs/builderkit/src/styles/generated/`. Cada app importa
 * SOLO el tema que le corresponde desde su `src/styles.css`.
 *
 * Convenciones (las mismas que en ems22):
 *   - Cada paleta va de 50 a 900. El generador agrega `DEFAULT` = 500.
 *   - `on-<paleta>` es el color de texto/ícono sobre cada tono de esa paleta. Si no se define,
 *     el generador lo calcula (algoritmo de `generate-contrasts.js` de ems22).
 *   - Clave `x` → utilidades `bg-x`, `bg-x-500`, `text-on-x`, `border-x-200/50`, …
 *     y variables `--color-x-500`, `--color-on-x-500`.
 */

import * as common from './palettes/common.mjs';
import * as emarsuite from './palettes/emarsuite.mjs';
import * as material from './palettes/material.mjs';
import * as rg from './palettes/rg.mjs';

/**
 * Paletas que referencia Material (`libs/builderkit/src/styles/material/_system-tokens.scss`).
 * Se emiten con `@theme static` porque Material las lee desde otra hoja de estilos y Tailwind
 * no puede saber que se usan. El resto de las paletas solo se emite si alguna clase la usa.
 * Si se cambia el mapeo de Material, hay que actualizar esta lista.
 */
export const staticPalettes = ['primary', 'accent', 'warn', 'app_tertiary', 'gray'];

/**
 * Paletas Material M2 iguales para todas las marcas (`generated/colors.css`).
 * Reemplazan a las gray/green/red/yellow/orange por defecto de Tailwind.
 * `gray` alimenta las superficies de Material (surface-container-*, inverse-surface, …).
 */
export const materialPalettes = {
  gray: material.gray,
  green: material.green,
  red: material.red,
  yellow: material.yellow,
  orange: material.orange,
};

/**
 * Esquema light (ems22 `customProps.background/foreground.light`).
 * Genera variables `--app-<clave>` (`generated/colors.css`), que consumen:
 *   - las utilidades `bg-card`, `bg-default`, `text-secondary`, … (`tailwind/design-system.css`);
 *   - las superficies y textos de Material (`material/_system-tokens.scss`).
 * El modo dark no se genera: ninguna app lo usa (en ems22 todas tienen `scheme: 'light'`).
 * No se portan `bg-status-bar`, `icon` ni `mat-icon` de ems22, porque nada los consume.
 */
export const scheme = {
  light: {
    'bg-app-bar': material.gray[100],
    'bg-card': '#ffffff',
    'bg-default': material.gray[50],
    'bg-dialog': '#ffffff',
    'bg-hover': 'rgba(0, 0, 0, 0.04)',
    'text-default': 'rgba(0, 0, 0, 0.87)',
    'text-secondary': 'rgba(0, 0, 0, 0.54)',
    'text-hint': 'rgba(0, 0, 0, 0.38)',
    'text-disabled': 'rgba(0, 0, 0, 0.38)',
    border: 'rgba(0, 0, 0, 0.12)',
    divider: 'rgba(0, 0, 0, 0.12)',
  },
};

/**
 * Temas de marca. Cada uno genera `generated/theme-<nombre>.css`.
 *
 * Mapeo hacia Material M3 (ver `material/_system-tokens.scss`):
 *   primary → primary · accent → secondary · app_tertiary → tertiary · warn → error
 *
 * `default` es la base: los demás temas heredan las paletas que no definen
 * (como `_.defaults` en ems22). Así `rg` recibe app_green, app_yellow y app_red.
 */
export const themes = {
  /** eMarsuite: lo usa `apps/fuse`. */
  default: {
    primary: emarsuite.primary,
    'on-primary': emarsuite.primaryContrast,
    accent: emarsuite.accent,
    'on-accent': emarsuite.accentContrast,
    warn: common.red,
    'on-warn': common.redContrast,
    // Colores extra de la marca. ems22 no les define contraste: lo calcula el generador.
    app_secondary: emarsuite.secondary,
    app_tertiary: emarsuite.tertiary,
    // Colores utilitarios (estados: éxito, alerta, error).
    app_green: common.green,
    app_yellow: common.yellow,
    app_red: common.red,
  },

  /** Retail Group: lo usa `apps/spark`. */
  rg: {
    primary: rg.primary,
    'on-primary': rg.primaryContrast,
    accent: rg.accent,
    'on-accent': rg.accentContrast,
    warn: common.red,
    'on-warn': common.redContrast,
    app_secondary: rg.secondary,
    'on-app_secondary': rg.secondaryContrast,
    app_tertiary: rg.tertiary,
    'on-app_tertiary': rg.tertiaryContrast,
  },
};
