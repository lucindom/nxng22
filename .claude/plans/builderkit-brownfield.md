# BuilderKit Core brownfield en fuse y spark (vive en libs/builderkit)

Objetivo: instalar Core (skill builderkit, "Install Core into an existing app") una sola vez en `libs/builderkit`;
`apps/fuse` y `apps/spark` solo consumen la lib (estilos, assets y providers).

## Ubicación (decidida con el usuario)
- core + ui: `libs/builderkit/src/app/{core,ui}`
- estilos: `libs/builderkit/src/styles` (entrada `styles.css`)
- fuentes: `libs/builderkit/assets/fonts` (assets de las apps con `input` a esa carpeta)
- alias `@/*` → `libs/builderkit/src/*` en `tsconfig.base.json` (los bloques importan `@/app/core/...`)
- Fuente del contenido: copia local `C:\gklusa\proys\builderkit` v4.0.0 (sin clonar `.builderkit`)

## Pasos
- [x] 1. Copiar core/ui/styles/assets a la lib
- [x] 2. Paquetes (aprobados): cn 0.4.0, cva 1.0.0-beta.12, colorjs.io 0.7.1, @angular/aria 22.2.2
- [x] 3. Alias `@/*` en tsconfig.base.json
- [x] 4. Apps: `styles.css` importa la lib (sin `tailwindcss` propio), `project.json` (styles, assets, budgets sin maximumError, `implicitDependencies: ["builderkit"]`), `index.html` (`id="bui"`, script de scheme, preloads de fuentes), host class en `app.ts`, providers en `app.config.ts`
- [x] 5. Se eliminó el tema Material propio (`material-theme.scss` azure/rose) y el link a Roboto
- [x] 6. Verificado: `nx build fuse spark` OK, `#bui` y `min-h-full` en styles-*.css, utilidades propias (`grow`, `p-5`), fuentes emitidas, `tailwind:sources:check` OK

## Decisiones
- El skill pide `clsx` + `tailwind-merge`, pero Core importa `cn` y `cva`; manda el código/`templates/spark/package.json`.
- `libs/builderkit/src/styles-ems/**` queda intacto y sin consumidores.
- Solo core/ui/styles/assets: "domains" es demo del template Spark, no es parte de Core brownfield; no se copió.

## Pendientes y riesgos
- `@import 'tailwindcss' important` de Core autodetecta fuentes desde la raíz del workspace (además del `@source` de cada app): puede incluir clases de otras apps. Si pesa, usar `source(none)` en `styles/styles.css` de la lib.
- Fuera de alcance: `apps/notheme` no se tocó; `.gitignore`/`CLAUDE.md` sin sección BuilderKit (no hay `.builderkit` clonado ni CLAUDE.md de proyecto).
- No se corrió lint ni `ng test`; los specs de Core vienen copiados.
- Revisión visual en navegador pendiente (`nx serve fuse|spark`): componentes de `libs/ui`/`libs/layout` ahora renderizan bajo el tema de Core.

## Customizaciones EMS en css-first (2026-10-15)
- `libs/builderkit/src/custom/custom-theme.css` (solo `@theme`, `@custom-variant`, `@utility`), importado en `styles.css` de fuse y spark DESPUÉS de Core (Core resetea `--text-*`/`--color-*`).
- Aplicado: `--text-md`, `--text-7xl..10xl` (Core conserva xs..6xl); breakpoints sm 600/md 960/lg 1280/xl 1440, `2xl` initial; variantes `lt-sm/md/lg`; paletas Material gray/green/red/yellow/orange 50–900; `animate-spin-slow`; `ease-drawer`; `flex-1-error`.
- No aplicado: lo nativo en v4 (spacing, opacity, rotate, z-index, duration), `corePlugins`, `darkMode`, `important`, plugins de Fuse y typography.
- Paletas de tema vía `provideTheming` (valores actuales los fija el usuario en cada `app.config.ts`; ya no son los iniciales #26334a / #fe7801); error #f5365c (red 500 de ems22) en ambas; neutral queda el de Core. Solo se pasa el color base: Core genera su escala 1–12, no la 50–900 de ems22.
- Verificado con `@tailwindcss/node` (clases emitidas) y `nx build fuse spark`.
- `custom-theme.css` (final): `color="primary|accent|warn"` (mat-primary/mat-accent/mat-warn) con tokens `--role-*` mapeados a los colores de provideTheming: primary→primary, warn→error, accent→neutral (provideTheming no genera accent). Cubre icon, button (relleno), icon-button, fab, checkbox, radio, slide-toggle, slider, progress-bar/spinner, tabs, form-field. No cubre badge, chips ni toolbar.
- Solo fuse (también `mat-primary` = paleta ems-dark-blue 50–900, tokens `--color-ems-dark-blue-*`; y `mat-warn` = red 500/600): `libs/builderkit/src/custom/custom-ems-theme.css` (importado después de `custom-theme.css`) define `--color-accent-50..900` (paleta accent de ems22), `accent-contrast`, `accent-a3/a4/a9/a10`, `accent-text` en `@theme` y sobreescribe los `--role-*` de `.mat-accent` (relleno 500, hover 600, texto 700). Spark conserva accent = neutral.

## Auditoría de custom-theme.css / custom-ems-theme.css (2026-10-16)
Verificado con `@tailwindcss/node` y Chrome headless (playwright-core + Chrome del sistema) sobre el build.
- Eliminado `@utility flex-0`: no funcionaba. Tailwind emite el `flex-0` nativo (`flex: 0`) en la misma regla y después, así que gana; v4 no tiene namespace `--flex-*`. Equivalente nativo de ems22 `flex-0` = `flex-none`.
- Eliminados `@utility min-w-screen` / `max-w-screen`: nativos en v4 con el mismo valor (100vw).
- Eliminado `--icon-button-bg-color-active`: Core lo define pero ningún `var()` lo lee.
- `custom-ems-theme.css`: transparencias a/9/10/3/4 pasan de `rgb()` duplicado a `color-mix(in srgb, <500> N%, transparent)` (mismo color resultante); comentario de cabecera corregido.
- Se conserva (verificado que funciona y ems22 lo usa): `lt-*` (=`max-*` nativo, 191 usos en ems22), `flex-1-error` (429), `text-md`/`7xl..10xl`, `animate-spin-slow` (emite `@keyframes spin`), `ease-drawer`, paletas 50–900, `--color-accent` (`bg-accent`, 191 usos), `--breakpoint-2xl: initial` (en ems22 `2xl:` tampoco existía).
- Tailwind solo emite las variables que algo consume: sin peso muerto por paletas.
- Decidido por el usuario (se deja así): Material pone `mat-accent` por defecto en checkbox/radio/slide-toggle y `mat-primary` en progress/spinner/slider/tabs/form-field, así que las reglas `--role-*` también recolorean esos componentes sin `color=`.
- Corrección: en el botón con color el relleno visible es el `::before` (paso 500); el 600 (`--button-border-color`) solo es el borde de 1px.
- provideTheming corregido (2026-10-16): fuse primary #26334a (ems-dark-blue 500, igual que `color="primary"`), neutral #8B8D98; spark neutral #8B8D98 (antes #fe7801 teñía textos/bordes/íconos). Spark primary sigue #1bb1dc (accent de rg); el primary de rg es #fe7801: pendiente confirmar con el usuario.
- Simplificación opción A (2026-10-16): en `custom-ems-theme.css` se eliminaron las 18 variables intermedias (`--color-{accent,ems-dark-blue,warn}-{contrast,a3,a4,a9,a10,text}`); cada `--role-*` se calcula directo desde la paleta (paleta → rol → variable de BuilderKit). Se conservan las paletas 50–900 y `--color-accent`. Verificado: 136 colores resueltos por app en Chrome, 0 diferencias en fuse y spark.
- Revisión de `custom-theme.css` (2026-10-16): sin variables de paso que quitar (los roles apuntan directo a los tokens de BuilderKit). Selector del botón: la clase triplicada se reemplazó por la estructura del selector de Core + `:is(color)` (misma especificidad); comentario sobre las clases `mat-*` por defecto de Material; `text-md` anotado como igual a `text-base`; formato. Verificado: 0 diferencias en 136 colores por app.
- Evaluado y descartado por el usuario (2026-10-16): dar prioridad global a `bg-*`/`text-*` de Tailwind sobre el relleno del botón (extender `@utility bg-*`/`text-*`, o `::before { background: inherit }`). No se aplicó nada. Hecho a recordar: en botones BuilderKit el relleno visible es el `::before` (`--button-bg-color`), por eso `bg-*` en el host queda tapado.

## Fuente Lato (2026-10-16)
- Forma pedida por el usuario: como el link de Google de ems22, pero local. `index.html` de fuse y spark: `<link href="assets/fonts/lato/lato.css" rel="stylesheet" />` (reemplaza los preloads de Inter). CommitMono (mono) sin cambios.
- `libs/builderkit/assets/fonts/lato/lato.css`: los `@font-face` con urls relativas. Archivos: Lato 2.015 (paquete npm `lato-font` 3.0.0, MIT+OFL; no se instaló, solo se tomaron los woff2) originales sin modificar (~180 KB c/u, todos los idiomas de Lato; idénticos byte a byte a los del paquete): Light 300, Regular 400, Italic 400, Medium 500, SemiBold 600, Bold 700, BoldItalic 700. Lato de Google (v1) no tiene 500/600: el `600` del link de ems22 caía en 700.
- `custom-theme.css` (`@theme`): `--font-sans: Lato, system-ui`, `--font-sans--font-feature-settings: normal` (salt es de Inter) y pesos estándar normal 400 / medium 500 / semibold 600 / bold 700 (Core: 450/550/650, para Inter variable).
- No se tocó Core: su `@font-face` de Inter queda, pero no se descarga porque nada lo usa.
- Verificado en Chrome: body `Lato, system-ui`; 300–700 resuelven a su archivo propio (sin síntesis); el navegador solo baja los pesos que se usan; sin avisos de preload.
- Licencia: `libs/builderkit/assets/fonts/lato/OFL.txt` (copyright tyPoland Lukasz Dziedzic, RFN "Lato", texto OFL 1.1 completo; tomado del README de `lato-font` y del name table de la fuente). Se copia a `dist/.../assets/fonts/lato/` junto con los woff2.
- Licencia resuelta (opción 1 del usuario): se descartó el recorte a latin porque la OFL lo considera Modified Version y no puede conservar el nombre reservado "Lato"; se usan los archivos originales.

- `custom-theme.css` (2026-10-16): el bloque `.mat-primary` EMS (líneas 273-282) pasa de `--color-ems-dark-blue-500/600` a `--color-primary-9/10` (Core pone el color base de provideTheming en el paso 9 y su hover en el 10). Verificado en Chrome: fuse primary-9 = #26334a, spark = #1bb1dc; 0 referencias a `ems-dark-blue` en el CSS emitido. Reportado sin tocar: el segundo juego de `.mat-primary/.mat-accent/.mat-warn` pisa por completo al primero (misma especificidad, va después); `--color-accent-*` ahora está en el `@theme` compartido, así que spark también usa el accent EMS; `custom-ems-theme.css` queda sin consumidores.
