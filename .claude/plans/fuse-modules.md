# Módulos de bui-fuse en apps/fuse

## Objetivo
Traer los 15 módulos funcionales de `C:\gklusa\proys\bui-fuse\src\app\domains\admin\modules` a `apps/fuse/src/app/modules`, registrarlos como rutas hijas del `AdminLayout` en `apps/fuse/src/app/app.routes.ts` (como en `bui-fuse/.../admin/routes.ts`) y mostrarlos en el menú del sidebar con la navegación de `bui-fuse/.../layout/data/navigation.ts`, dentro de la config del layout (`ADMIN_LAYOUT_CONFIG`).

## Decisiones del usuario
- Instalar los 8 paquetes (versión exacta): `date-fns@4.4.0`, `@angular/material-date-fns-adapter@22.2.2` (no 22.2.1: su peer exige `@angular/material` exacto y aquí está 22.2.2), `apexcharts@7.1.0`, `ng-apexcharts@3.1.0`, `fullcalendar@7.1.1`, `@fullcalendar/angular@7.1.1`, `@fullcalendar/rrule@7.1.1`, `temporal-polyfill@1.0.5` (`rrule` entra como peer).
- La ruta raíz del layout redirige a `dashboards`; `material1` se conserva como ruta y entrada de menú (sección Demo).

## Hallazgos
- 108 archivos (~47.7k líneas TS) + `calendar/styles/fullcalendar.css`; `@Service()` existe en Angular 22.1.8.
- Los módulos importan entre sí con el alias `@/app/domains/admin/modules/...`; aquí `@/*` apunta a BuilderKit, así que se reescriben a rutas **relativas** (como el resto de las apps). `@/app/core/*` y `@/app/ui/*` no cambian.
- Referencias fuera de `modules/`: `ChartResize` (`domains/admin/ui/chart-resize.ts`) → `apps/fuse/src/app/ui/`; `FavoriteToggle` (projects, teams) → `lib-favorite-toggle` de `@nx-ng-v22/layout`; `SidebarService` (settings/preferences) → `SidebarSchemeService` de la lib; `AdminLayout` (not-found/routes.ts) → de la lib.
- `settings/data/preferences.ts` ya define `THEME_PRESETS`: el layout deja de duplicarlos (borrar `layout/data/theme-presets.ts`).
- `NotificationsService` de los módulos reemplaza a `NotificationsStore`: un adaptador a `INotificationsSource`. Badge del Inbox: `navigationBadges` con `InboxService.unread()`.
- `app.config.ts` de bui-fuse añade: `withComponentInputBinding`, `withInMemoryScrolling`, `provideDateFnsAdapter` + `MAT_DATE_LOCALE`, `MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS`, `provideViewportScroller()`.
- Imágenes: se copian solo las que referencian los módulos (`/images/photos/*`, `/images/notes/*`).

## Pasos (se detiene tras cada lote)
- [x] 1. Paquetes instalados (8, exactos; `rrule` como peer), providers en `app.config.ts` (sin `PreloadAllModules` de bui: evita precargar fullcalendar/apexcharts), 33 imágenes copiadas (564 KB), `ui/chart-resize.ts`.
- [x] 2. 108 archivos copiados a `apps/fuse/src/app/modules` con imports relativos (script), Prettier solo sobre esa carpeta, `ngc --noEmit -p apps/fuse/tsconfig.app.json` sin errores.
- [x] 3. Rutas (`app.routes.ts`: 15 módulos + `material1` bajo `AdminLayout`, raíz → `dashboards`, not-found aparte), `layout/data/navigation.ts` (NAVIGATION de bui + sección Demo), `layout/data/layout-data.ts` (`FuseLayoutData`: notificaciones y badge del Inbox desde los módulos, cargados con `import()` tras el primer render para no meter sus datos en el bundle inicial), presets desde `settings/data/preferences`. Se borraron `layout/data/notifications.ts` y `theme-presets.ts`.
- [x] 4. `nx build fuse spark notheme` OK. Chrome (build de producción): las 22 rutas y un 404 cargan sin errores de consola ni peticiones fallidas, el ítem activo del menú se resalta, el badge del Inbox muestra 7 y la campana lista las notificaciones de los módulos.

## Riesgos
- Bundle: fullcalendar y apexcharts son pesados (los presupuestos solo avisan, sin `maximumError`).
- Módulos con datos mock grandes (`members`, `projects`) se cargan por ruta (lazy), no en el bundle inicial.
- El estilo "card" del layout exige `provideViewportScroller()` para restaurar el scroll en su panel.

## Lote 2: lo que hubo que ajustar
- `apps/fuse/tsconfig.json`: `lib: ["es2022", "dom"]` (la base trae `es2020`; los módulos usan `Array.prototype.at`). `target` ya era `es2022`. Solo afecta a fuse.
- **Compilador Angular:** bui-fuse compila con Angular 22.2.1, que permite `private` en plantillas; aquí `@angular/compiler-cli` es 22.1.8 y da 1663 errores TS2341. Decisión: no subir Angular; se cambió `private` → `protected` solo en los miembros que las plantillas leen (61 archivos, guiado por los errores del compilador), que es la convención de este repo. Riesgo: si se sube Angular a 22.2.x, el cambio es inocuo.
- Referencias a layout reescritas: `AdminLayout`, `FavoriteToggle` (`<lib-favorite-toggle>`) y `SidebarSchemeService` salen de `@nx-ng-v22/layout`; `ChartResize` desde `apps/fuse/src/app/ui/`.
- Sin ejecutar lint (member-ordering): los `protected` quedan en el mismo grupo que los `private` ya ordenados, pero conviene correr `nx lint fuse` cuando se quiera.

## Pendientes / avisos
- No se corrió `nx lint` (member-ordering tras los `private`→`protected`) ni tests (el runner de vitest ya fallaba antes).
- `lib-sidebar` sigue exportado porque `apps/notheme` lo usa.
- Los `app.spec.ts` de fuse y spark importan `./nx-welcome`, que no existe (previo).
