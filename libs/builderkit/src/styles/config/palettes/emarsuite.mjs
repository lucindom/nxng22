/**
 * Paletas de la marca eMarsuite (tema `default`).
 *
 * Origen: ems22 `libs/client/shared/tailwind-preset/assets/emarsuite/colors/index.js`.
 * Los valores que allá se calculaban con chroma-js (`chroma('black').alpha(0.87).css()`, etc.)
 * quedan aquí como literales.
 * ems22 no define `secondaryContrast` ni `tertiaryContrast`: esos contrastes los calcula el
 * generador, igual que `generate-contrasts.js` en ems22.
 */

const blackOpacity = 'rgba(0, 0, 0, 0.87)';
const white = '#ffffff';
const whiteOpacity = 'rgba(255, 255, 255, 0.87)';

const contrast = {
  50: blackOpacity,
  100: blackOpacity,
  200: blackOpacity,
  300: white,
  400: white,
  500: whiteOpacity,
  600: whiteOpacity,
  700: whiteOpacity,
  800: whiteOpacity,
  900: whiteOpacity,
};

export const primary = {
  50: '#a7b7d2',
  100: '#758db8',
  200: '#536fa2',
  300: '#3b4f72',
  400: '#30415e',
  500: '#26334a',
  600: '#1c2536',
  700: '#111722',
  800: '#07090d',
  900: '#000000',
};

export const primaryContrast = contrast;

export const accent = {
  50: '#ffffff',
  100: '#d1f2f6',
  200: '#a2e5ec',
  300: '#67d5e0',
  400: '#4dcedb',
  500: '#34c7d6',
  600: '#28b5c4',
  700: '#229eaa',
  800: '#1d8691',
  900: '#186f77',
};

export const accentContrast = contrast;

export const secondary = {
  50: '#fef6e6',
  100: '#fde9c1',
  200: '#fbda97',
  300: '#f9cb6d',
  400: '#f8bf4e',
  500: '#f7b42f',
  600: '#f6ad2a',
  700: '#f5a423',
  800: '#f39c1d',
  900: '#f18c12',
};

export const tertiary = {
  50: '#ffe0ee',
  100: '#feb3d5',
  200: '#fe80b9',
  300: '#fd4d9d',
  400: '#fc2688',
  500: '#fc0073',
  600: '#fc006b',
  700: '#fb0060',
  800: '#fb0056',
  900: '#fa0043',
};
