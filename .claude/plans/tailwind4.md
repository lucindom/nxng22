# Tailwind 4 en fuse y spark

Objetivo: que ambas apps usen Tailwind 4 correctamente.

## Pasos
- [x] 1. Entrada global `styles.scss` -> `styles.css` (Sass no soporta Tailwind 4) + project.json
- [x] 2. `tools/scripts/sync-tailwind-sources.mjs` adaptado a `apps/<app>/src/styles.css` y `libs/`; genera `@source` entre marcadores
- [x] 3. `autoprefixer` eliminado (innecesario con Tailwind 4)
- [x] 4. BOM removido de los `styles.css`
- [x] 5. `nx build fuse` y `nx build spark` OK; el CSS generado trae layers, preflight y utilidades (.flex, .p-5)
- [ ] 6. `tailwind:sources:check` en CI: el repo no tiene pipeline (.github / gitlab / azure); pendiente cuando exista

## Decisiones
- Tailwind 4 no funciona a traves de Sass: entrada global en CSS.
- `@source` generado por script desde el grafo de Nx (apps + libs dependientes); ejecutar `npm run tailwind:sources` al agregar libs.
- `SOURCE_ROOTS = ["libs/"]` (las raices de proyecto no llevan barra final).
- `inlineStyleLanguage: scss` se mantiene; no usar `@apply`/`@theme` en scss de componentes.

## Riesgos
- `npm uninstall autoprefixer` dejo un aviso de `npm audit` sin revisar.
