# Design system (builderkit/styles)

Cada app carga **solo su tema**: fuse → `default` (eMarsuite), spark → `rg`.

```
config/themes.config.mjs        FUENTE DE VERDAD de los colores (+ config/palettes/*.mjs)
        │  npm run themes       (tools/scripts/generate-themes.mjs)
        ▼
generated/*.css                 @theme de Tailwind (NO editar a mano)
        │
        ├─► tailwind/design-system.css   fuentes, escala de texto, breakpoints, utilidades
        │        └─ importado por apps/<app>/src/styles.css, junto con generated/theme-<x>.css
        └─► material/theme.scss          --mat-sys-* = var(--color-*) / var(--app-*)
                 └─ listado en `styles` de apps/<app>/project.json
```

## Cómo cambiar un color
Editar `config/themes.config.mjs` (o la paleta en `config/palettes/`) y correr `npm run themes`.
`npm run themes:check` falla si los CSS generados están desactualizados.

## Cómo agregar un tema (p. ej. `mmr`, `mbp`)
1. Copiar su paleta desde ems22 a `config/palettes/<tema>.mjs`.
2. Agregarlo a `themes` en `themes.config.mjs` (hereda de `default` lo que no defina).
3. `npm run themes` → se crea `generated/theme-<tema>.css`.

## Cómo cambiar el tema de una app
Una sola línea en `apps/<app>/src/styles.css`:
`@import ".../generated/theme-<tema>.css";`

`material/theme.scss` es el mismo para todas las apps: no depende del tema.

## Mapeo marca → Material M3
primary → primary · accent → secondary · app_tertiary → tertiary · warn → error.
Superficies y textos salen del esquema light (`--app-*`) y de la paleta `gray`
(detalle en `material/_system-tokens.scss`). Las paletas que usa Material están en `staticPalettes`.

## Diferencias con ems22
- Un solo `theme.scss` y un solo tema por app; sin modo dark ni temas ajenos.
- Una variable por color (sin gemelas `-rgb`): `bg-primary/50` usa `color-mix` y conserva el alfa.
- `important` activado en Tailwind, como `important: true` en ems22.
- Lato no tiene peso 500 (el que usa Material en botones): el navegador cae a 400, igual que en ems22.
- No se porta lo que Tailwind v4 resuelve con valores dinámicos ni `typography` (ver `design-system.css`).
