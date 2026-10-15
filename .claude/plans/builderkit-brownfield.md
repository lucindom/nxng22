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
