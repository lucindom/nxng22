# Theming por app (fuse → `default`, spark → `rg`)

Objetivo: fuse aplica el tema `default` (EMS) y spark el tema `rg`, emulando lo que ems22 hace con
`libs/client/shared/tailwind-preset/tailwind.config.js`, pero con Tailwind v4 css-first y Material M3.
Cada app carga solo su tema: sin temas ajenos, sin modo dark que no se usa y sin CSS que después se pisa.

Cadena de verdad:
`libs/builderkit/src/styles/config/themes.config.mjs` → `tools/scripts/generate-themes.mjs` →
`libs/builderkit/src/styles/generated/*.css` (`@theme`) → utilidades de Tailwind + `--mat-sys-*` de Material.

Plan completo (arquitectura, tabla de mapeo de Material, riesgos):
`C:\Users\lucin\.claude\plans\investiga-como-el-proyecto-calm-castle.md`

## Archivos afectados
- `libs/builderkit/src/styles/**` (nuevo: config, generated, tailwind, material, README)
- `tools/scripts/generate-themes.mjs` (nuevo), `package.json` (scripts `themes`, `themes:check`)
- `apps/{fuse,spark}`: `project.json`, `src/styles.css`, `src/index.html`, `src/app/app.html`; se borra `src/material-theme.scss`
- `libs/layout/src/lib/components/sidebar/sidebar.ts`
- Se borran `libs/ui/src/assets/@common/colors/` y `libs/ui/src/assets/fuse/colors/`

## Pasos
- [x] 0. Plan en el repo
- [x] 1. Config y paletas ESM en `libs/builderkit/src/styles/config/` + borrar paletas JS obsoletas
- [x] 2. Generador `tools/scripts/generate-themes.mjs` + scripts npm + CSS generados
- [x] 2b. Estilos movidos de `libs/ui/src/styles` a `libs/builderkit/src/styles` (lib `builderkit`); rutas del generador actualizadas
- [x] 3. `libs/builderkit/src/styles/tailwind/design-system.css`
- [x] 4. Material: `material/_system-tokens.scss` + `material/theme.scss`
- [x] 5. Conectar apps (project.json, styles.css, index.html Lato, borrar material-theme.scss) + README
- [x] 6. Extras: sidebar tematizado, spark app.html → Tailwind, fuse app.html `flex-grow` → `grow`
- [x] 7. Verificación (themes:check, build y serve con permiso del usuario)

## Decisiones
- Fuente de verdad: config JS + generador, como ems22 (lo eligió el usuario). Lo que es estático
  (fuentes, escala de texto, breakpoints, utilidades) va a mano en CSS (css-first).
- Se emula `important: true` de ems22: `@import "tailwindcss" important`, porque los estilos de
  Material no van en capa y si no les ganarían a las utilidades.
- Material: un solo `theme.scss` compartido. `mat.theme(config, $overrides)` reemplaza cada
  `--mat-sys-*` en el mismo lugar donde lo emite, con `var(--color-*)`. La paleta placeholder no
  llega a la salida. `theme-type: light` evita generar el modo dark.
- Las paletas que referencia Material van en `@theme static` (la lista está en
  `themes.config.mjs` → `staticPalettes`); el resto se emite solo si se usa.
- Paletas portadas sin chroma: los contrastes con alfa quedan como literales `rgba(…, 0.87)`.
  `on-*` se omite donde ems22 lo calculaba (`generate-contrasts.js`); lo calcula el generador.
- `rg` hereda de `default` las paletas que no define (app_green, app_yellow, app_red), igual que
  `_.defaults` en ems22. A diferencia de ems22, el `on-` se hereda siempre junto con su paleta:
  un tema que redefine `primary` sin `on-primary` recibe contrastes calculados, nunca los de default.
- Del esquema light no se portan `bg-status-bar`, `icon` ni `mat-icon`, porque nada los consume.
- El generador borra los `theme-*.css` de temas que ya no están en la config, y `--check` también
  los detecta. Compara ignorando CRLF/LF, porque el repo usa `core.autocrlf=true`.
- Los contrastes calculados se verificaron contra ems22: on-app_secondary 50–300 = #f18c12,
  on-app_tertiary 50–100 = #fa0043, on-app_green 50–300 = #17ad5b, on-app_red 50–200 = #ee1630.

- Todo el theming (config, generated, tailwind, material) vive en `libs/builderkit`, no en `libs/ui`;
  las apps lo importan desde ahí. `libs/ui` queda solo con componentes.

- Verificado con la API de `@tailwindcss/node` (sin build de app): `bg-app_green-500` (guion bajo) funciona,
  `important` se aplica a utilidades, `animate-spin-slow` emite un único `@keyframes spin` (viene del
  tema por defecto, no se redeclara), `lt-md:` genera `max-width: 959px`, `icon-size-6` y `bg-card` salen bien.
  `theme.scss` compila con sass: una sola `--mat-sys-primary` = `var(--color-primary-500)` y ningún hex de azure.
- `--font-sans` va solo en `@theme static` (Material lo lee desde otra hoja); `--font-mono` en `@theme`.

## Pendientes y riesgos
- Probar que se acepta `@import "tailwindcss" source(none) important;`.
- Fuera de alcance, solo reportar: `libs/ui/src/lib/ui/ui.ts` apunta a archivos inexistentes;
  `autoprefixer` sobra en package.json; `sidebar.scss` vacío y huérfano.

## Verificación (2026-10-15)
- `themes:check` y `tailwind:sources:check` OK; `nx build fuse spark` OK.
- dist: primary-500 = #26334a (fuse) / #fe7801 (spark); una sola `--mat-sys-primary` = `var(--color-primary-500)`; sin azure, `.theme-`, `.dark` ni `light-dark(`; utilidades con `!important`; clases de `ui`/`layout` presentes.
- Pendiente solo manual: ver `/material1` en el navegador (nx serve fuse/spark). Lint no corrido (solo a pedido).
