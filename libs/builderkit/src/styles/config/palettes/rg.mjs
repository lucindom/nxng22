/**
 * Paletas de la marca Retail Group (tema `rg`).
 *
 * Origen: ems22 `libs/client/shared/tailwind-preset/assets/rg/colors/index.js`.
 * En ems22, `secondary` es la misma paleta que `accent` y `tertiary` es el verde común:
 * se conserva así.
 */

const contrastFrom400 = {
  50: '#000000',
  100: '#000000',
  200: '#000000',
  300: '#000000',
  400: '#ffffff',
  500: '#ffffff',
  600: '#ffffff',
  700: '#ffffff',
  800: '#ffffff',
  900: '#ffffff',
};

export const primary = {
  50: '#fff3ef',
  100: '#ffe9e1',
  200: '#ffd2c3',
  300: '#feb99f',
  400: '#fe9c71',
  500: '#fe7801',
  600: '#e66d01',
  700: '#cc6001',
  800: '#ae5201',
  900: '#894000',
};

export const primaryContrast = contrastFrom400;

export const accent = {
  50: '#eff7fb',
  100: '#e2f1f8',
  200: '#c4e2f1',
  300: '#a1d3ea',
  400: '#73c3e3',
  500: '#1bb1dc',
  600: '#18a0c7',
  700: '#168eb1',
  800: '#127996',
  900: '#0f5f76',
};

export const accentContrast = contrastFrom400;

export const secondary = accent;

export const secondaryContrast = contrastFrom400;

export const tertiary = {
  50: '#e7f9f1',
  100: '#c3f0dc',
  200: '#9ce6c5',
  300: '#74dbae',
  400: '#56d49c',
  500: '#38cc8b',
  600: '#32c783',
  700: '#2bc078',
  800: '#24b96e',
  900: '#17ad5b',
};

export const tertiaryContrast = {
  50: '#000000',
  100: '#000000',
  200: '#000000',
  300: '#000000',
  400: '#000000',
  500: '#000000',
  600: '#000000',
  700: '#000000',
  800: '#000000',
  900: '#ffffff',
};
