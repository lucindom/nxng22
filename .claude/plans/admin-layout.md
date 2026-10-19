# AdminLayout compartido en `libs/layout` para fuse y spark

## Context
`bui-fuse` y `bui-spark` tienen cada uno su `AdminLayout` (shell con sidenav + header + router-outlet) en `src/app/domains/admin/layout/`. Las dos apps de este workspace (`apps/fuse`, `apps/spark`) hoy no tienen shell: `app.html` pone a mano `<lib-sidebar>` + `<main>`. Se quiere un único `AdminLayout` en `libs/layout/src/lib/admin-layout/`, cargado en la ruta `path: ''` de cada app, donde **cada app aporta su configuración** (fuse la de bui-fuse, spark la de bui-spark) y la lib no depende de ninguna app.

## Decisiones del usuario
- Config por **provider con token**: `provideAdminLayout(() => config)`; los componentes hijos reciben sus variaciones por `input()`/`output()`.
- Widgets de fuse (ActionPanel, Notifications, QuickSettings, badge de Inbox, FavoriteToggle) **van a la lib** como componentes genéricos; sus datos entran por la config/tokens.
- `lib-sidebar` (SidebarComponent) se **absorbe** en el sidebar del AdminLayout y se elimina (componente, spec y export).

## Diferencias fuse vs spark que la config debe cubrir
| Aspecto | fuse | spark |
|---|---|---|
| `appearance` | `card` (contenido en tarjeta con ring, header sticky, `lg:h-dvh lg:p-2`) | `flat` (contenido plano, header simple) |
| Breakpoint móvil | `(width < 64rem)` | `(max-width: 767px)` |
| Marca | logomark + "FUSE / by BuilderKit" | logo imagen claro/oscuro |
| Navegación | árbol con secciones, colapsables, badges | una sección "Navigation" plana |
| Header | toggle, quick-settings, scheme-switcher, action-panel, notifications, user (móvil) | solo toggle |
| Sidebar | favoritos, esquema oscuro (`SidebarService`), promo, footer user solo en `lg` | promo, footer user siempre |
| User menu | perfil, Upgrade to Pro, Account, Notifications, Color scheme, Preferences, Sign out | Account, Notifications, Color scheme, Sign out |

## Diseño (archivos nuevos en `libs/layout/src/lib/admin-layout/`)
- `models/admin-layout-config.ts`: interfaces `IAdminLayoutConfig`, `IAdminBrand`, `IAdminHeader` (flags de widgets), `IAdminSidebar` (favorites, promo, darkSchemeToggle), `IAdminUser` + `IUserMenuItem` (menú por datos: `id`, `label`, `icon`, `route?`, `action?: "signOut"`, `dividerBefore?`), `IAdminPromo`, `IThemePreset`, `INotification`, `INotificationsSource`, `ISearchData`.
- `admin-layout.token.ts`: `ADMIN_LAYOUT_CONFIG` (InjectionToken) y `provideAdminLayout(factory: () => IAdminLayoutConfig)` (factory corre en contexto de inyección: la app puede hacer `inject(NotificationsStore)`). Si falta el token, error claro.
- `admin-layout.ts`: `AdminLayout` (`selector: "lib-admin-layout"`), `host.class = "flex min-h-full w-full flex-auto flex-col"`. Lee la config con `inject()`, crea `isMobile` una sola vez (`Media.match(config.mobileBreakpoint)`), `sidenav` con `viewChild.required`. Variación de clases por `appearance` con un `Record` (sin cadenas de `if`). `private`→`protected` para lo que lee el template.
- `ui/`: `sidebar`, `user`, `scheme-switcher`, `favorite-toggle`, `action-panel`, `notifications`, `quick-settings`. Cada uno con `input()` (`compact`, `position`, `label`, `icon`, datos) y `output()` donde aplique; sin acoplarse a servicios de dominio de fuse.
- `services/sidebar-scheme.ts`: copia de `SidebarService` de fuse (signal + localStorage `sidebarScheme`), `providedIn: "root"`.
- Reutiliza lo ya existente en la lib: `FavoritesService`, `RouteNavigation`, `INavigationItem`, `AuthService` de `@nx-ng-v22/core` (cierre de sesión por defecto: `logout()`).
- `libs/layout/src/index.ts`: exporta `AdminLayout`, `provideAdminLayout`, `ADMIN_LAYOUT_CONFIG`, modelos, `FavoriteToggle`; quita `sidebar/sidebar`.

Cambios a código existente
- `RouteNavigation.build()`: hoy ignora rutas sin `path`; con el layout en `path: ""` no vería a los hijos. Debe **entrar a los hijos de rutas sin path** (mismo `parentPath`) y seguir ignorando redirects. Ajustar su uso.
- Eliminar `libs/layout/src/lib/components/sidebar/` (`sidebar.ts`, `sidebar.spec.ts`).

## Por app (cada una con su propia config, como pidió el usuario)
- `apps/fuse/src/app/layout/`: `fuse-layout.config.ts` (config completa), `data/` con lo copiado de bui-fuse: presets de tema (`PRIMARY_COLORS`, `NEUTRAL_COLORS`, `THEME_PRESETS`), usuarios y proyectos de búsqueda, notificaciones de ejemplo + un `NotificationsStore` (signals) que implementa `INotificationsSource`. Los datos de bui-fuse que dependen de módulos que no existen aquí (Customers, Members, Projects, Tasks, Inbox) se reemplazan por semillas planas; el badge de Inbox queda como signal fijo.
- `apps/spark/src/app/layout/spark-layout.config.ts` (config de bui-spark: flat, 767px, logos, navegación "Navigation", promo, menú de usuario).
- `app.config.ts`: `provideAdminLayout(...)`. `app.routes.ts`: `{ path: "", component: AdminLayout, children: [<rutas actuales>, { path: "", pathMatch: "full", redirectTo: "material1" }] }`. `app.html`: solo `<router-outlet />`. `app.ts`: quita `SidebarComponent`; el `host.class` (`flex min-h-full w-full flex-auto flex-col`) ya está en `app.ts` de ambas.
- Los assets de bui (logos, fotos `/images/...`) **no están** en estas apps: se copian a `apps/<app>/public/images/` solo los que usa la config.

## Pasos (se avanza por lote y se detiene tras cada uno; el plan se copiará a `.claude/plans/admin-layout.md`)
- [x] 1. Modelos, token, `provideAdminLayout`, `SidebarSchemeService` (`models/admin-layout-config.ts`, `admin-layout.token.ts`, `services/sidebar-scheme.ts`).
- [x] 2. `scheme-switcher`, `user-menu`, `favorite-toggle` (`ui/`, selectores `lib-scheme-switcher`, `lib-user-menu`, `lib-favorite-toggle`; clases `SchemeSwitcher`, `UserMenu`, `FavoriteToggle`). Verificado con `ngc --noEmit` (incluye plantillas).
- [x] 3. `ui/admin-sidebar.ts` (`lib-admin-sidebar`, clase `AdminSidebar`; absorbe la lógica de `lib-sidebar`) + `RouteNavigation` entra a las rutas sin path con hijos. `lib-sidebar` sigue exportado hasta el lote 5.
- [x] 4. `ui/action-panel.ts` (`lib-action-panel`), `ui/notifications-menu.ts` (`lib-notifications-menu`), `ui/quick-settings.ts` (`lib-quick-settings`). `ngc --noEmit` sin errores.
- [x] 5. `AdminLayout` (`admin-layout.ts`, `lib-admin-layout`), exports en `index.ts`, specs de `RouteNavigation` y del token. El borrado de `lib-sidebar` pasa al lote 6 (las apps aún lo importan).
- [x] 6. Config + datos + assets + rutas de fuse y spark (`apps/<app>/src/app/layout/`, `app.routes.ts`, `app.config.ts`, `app.html`, `app.ts`). `nx build fuse spark` OK. `lib-sidebar` NO se borró (ver abajo).
- [ ] 7. Verificación.

## Reglas a respetar (CLAUDE.md global)
Orden de miembros (member-ordering: estáticos, decorados/inputs, campos, constructor, accessors, métodos; `inject()` privados al final de los campos), signals como única fuente de verdad, `input()/output()/viewChild()`, `OnPush`, interfaces con prefijo `I`, sin `any` ni `!`, sin código muerto, `if` con llaves. Estilo del repo: comillas dobles y `@Injectable`.

## Riesgos / puntos a vigilar
- Routed component: no puede recibir `output()` desde fuera; los eventos (cerrar sesión, marcar leído) van por la config (`onSignOut`) o servicios, no por outputs del layout.
- Tailwind v4 solo emite clases que ve: la lib y las apps ya están en `@source`; las clases dinámicas de presets (`border-sand-a6`…) viven en `apps/fuse` (ya escaneado).
- `@Service()` de bui (Angular 22) vs `@Injectable` de la lib: se mantiene `@Injectable`.
- Navegación: las entradas de `NAVIGATION` de bui-fuse apuntan a rutas inexistentes aquí; por defecto cada app usa la navegación **derivada de sus rutas** (`RouteNavigation`) para no dejar enlaces rotos, salvo que la config la sobrescriba.
- Iconos `svgIcon` (`panel-left`, `search`…) vienen de `provideIcons()` de Core (ya activo en ambas apps).

## Verificación
- `nx build fuse spark` sin errores ni avisos nuevos de presupuesto.
- Chrome (playwright-core + Chrome del sistema, como en sesiones previas): en ambas apps el layout carga en `/`, el sidenav pasa de `side` a `over` en el breakpoint de cada app, la navegación lista las rutas, el cambio de scheme/tema funciona, y fuse muestra header completo mientras spark solo el toggle.
- Specs: `admin-layout.spec.ts` (crea el componente con `provideRouter` + config de prueba) y se corre solo `nx test layout` si el usuario lo pide.

## Decisiones de diseño tomadas en el lote 1
- Un widget con datos del header (`search`, `notifications`, `quickSettings`) se muestra cuando la app los provee: la presencia del dato es el flag, para no tener flag verdadero con datos ausentes.
- La marca es una unión discriminada (`kind: "mark" | "logo"`), no un conjunto de opcionales.
- El menú de usuario es por datos (`IUserMenuItem`, con `action: "signOut" | "scheme"`); así fuse y spark solo difieren en la config.
- `INotificationsSource` (signals + `markAllRead/markRead/resolve`) reemplaza al `NotificationsService` de fuse.
- `SidebarSchemeService` valida el valor guardado en localStorage (`dark | light`) en vez de castearlo.
- Lote 2: el componente `user` de fuse/spark se llama `UserMenu` (`lib-user-menu`) para no chocar con el nombre genérico `user`; recibe `IAdminUser` por `input.required` y emite `signedOut` (la acción real la resuelve el layout: `onSignOut` de la config o `AuthService.logout()`). Se unificó el estilo del botón de spark con el de fuse (padding por variables CSS); fuse conserva su `grayscale` vía `avatarClass`.
- Lote 2: `FavoriteToggle` y `UserMenu` tienen `inject()` y campos ordenados public → protected → private (member-ordering).
- Lote 3: `AdminSidebar` recibe por inputs `appearance`, `brand`, `navigation`, `badges`, `showFavorites`, `promo`, `user` y emite `signedOut`. Las clases que difieren entre fuse y spark salen de un `Record<AdminAppearance, ISidebarStyles>`.
- Lote 3: la expansión de la ruta activa ya no muta la navegación ni usa `effect()`: es un `computed()` puro que, tras la primera `NavigationEnd`, devuelve copias con `expanded` (se evalúa en `untracked`, por lo que no vuelve a abrir ramas que el usuario cerró en navegaciones posteriores).
- Lote 3: spark pasa de un encabezado de sección propio a un ítem `section: true` en la navegación (se ve en mayúsculas pequeñas, como las secciones de fuse).
- Lote 3: `RouteNavigation.build()` usa `flatMap` y trata como "ruta de layout" a `path: ""` con hijos (publica los hijos bajo el mismo `parentPath`); los redirects `path: ""` siguen fuera.
- Lote 4: `notifications` se renombró `NotificationsMenu` (`lib-notifications-menu`); su entrada es `INotificationsConfig` (`source` + `settingsRoute?` + `viewAllRoute?`, nuevo en el modelo): los enlaces a ajustes y "ver todas" solo se dibujan si la app define la ruta (en bui estaban fijos a `/settings/notifications` y `/notifications`, que aquí no existen). `IAdminHeader.notifications` pasó de `INotificationsSource` a `INotificationsConfig`.
- Lote 4: `ActionPanel` recibe `data: ISearchData` y `compact`. Se eliminó la repetición de bui: acciones rápidas, pistas del pie y filtros son listas de datos recorridas con `@for` (antes eran 3 bloques casi idénticos y 3 pistas copiadas). Los filtros y las acciones rápidas siguen fijos en el componente (son demo); solo usuarios y proyectos dependen de la app.
- Lote 4: `QuickSettings` recibe `themePresets` y `sidebarScheme` (booleano que muestra el interruptor de sidebar oscuro, ligado a `IAdminSidebar.darkScheme`); lee/escribe el esquema del sidebar con `SidebarSchemeService`.
- Lote 5: `AdminLayout` lee la config con `injectAdminLayoutConfig()`; las clases por apariencia salen de `LAYOUT_STYLES` (`card`/`flat`). La región con scroll (`cdkScrollable` + `buiScrollViewport`) solo se registra en `card`: en `flat` el scroll es del documento y registrar un panel que no hace scroll rompería la restauración de scroll si la app activa `provideViewportScroller()`. Cabecera y contenido son un `ng-template` compartido por ambas ramas.
- Lote 5: sin config → error claro; cierre de sesión: `config.onSignOut` o `AuthService.logout()` (de `@nx-ng-v22/core`). El host lleva `flex min-h-full w-full flex-auto flex-col` y el contenedor del sidenav `flex-auto` para llenar la altura.
- Lote 5: la navegación del sidebar es `config.navigation ?? RouteNavigation.build()` (una sola vez, al crear el layout).
- Lote 5: `nx test layout` y `nx test core` fallan antes de ejecutar nada ("Vitest failed to find the runner", incluso con el spec previo de sidebar): problema previo del entorno de tests, no de estos cambios. Los specs nuevos se verificaron solo con `tsc -p tsconfig.spec.json`.
- Lote 6: fuse: `layout/fuse-layout.config.ts` + `layout/data/{theme-presets,search-data,notifications}.ts` (`NotificationsStore` implementa `INotificationsSource`); spark: `layout/spark-layout.config.ts` (navegación = rutas de la app bajo una sección "Navigation"). Assets copiados solo los usados: fuse `logomark.svg` + 4 fotos; spark 2 logos + 1 foto.
- Lote 6: `app.routes.ts` de ambas: `{ path: "", component: AdminLayout, children: [redirect "" -> material1, ...rutas] }`; `app.html` = `<router-outlet />`; `app.ts` importa solo `RouterOutlet` (el `host.class` `flex min-h-full w-full flex-auto flex-col` ya estaba).
- Lote 6: **`lib-sidebar` no se borra**: `apps/notheme` también lo usa (`app.ts`, `app.html`) y se rompería. Pendiente de decidir con el usuario (migrar notheme al AdminLayout, o conservar `lib-sidebar` solo para notheme).
- Lote 6: humo en Chrome (build de producción): ambas apps cargan sin errores de consola, `/` redirige a `/material1`, sidenav `side` a 1400px y `over` a 600px; fuse muestra quick-settings, scheme-switcher, búsqueda, notificaciones y usuario compacto; spark solo el toggle (+ usuario en el sidebar).
- Pendiente previo (no de este trabajo): `app.spec.ts` de fuse y spark importan `./nx-welcome`, que no existe.

## Sidebar contraído (solo iconos)
- En escritorio el botón del header ya no cierra el sidenav: alterna `AdminLayout.collapsedState` y el sidenav pasa al ancho `config.sidebar.width` (por defecto `100px`). En móvil (`over`) sigue abriendo/cerrando.
- `AdminSidebar` recibe `collapsed`: oculta etiquetas, badges y cabeceras de sección con selectores sobre los `data-slot` de BuilderKit (sin tocar sus directivas), centra los botones, oculta textos de marca, chevrons y promo, muestra tooltips con la etiqueta y el usuario compacto. Marca `logo` (spark) usa `markLightSrc/markDarkSrc` (isotipos copiados de bui-spark).
- El ancho fijo `w-60` (que con `important` gana al estilo inline) solo se aplica expandido (`sidenavWidth`); `afterRenderEffect` llama a `updateContentMargins()` porque Material solo mide el drawer al abrir/cerrar.
- Verificado en Chrome (fuse y spark, 1400px): 100px y margen del contenido 100px al contraer, 0 etiquetas visibles, iconos centrados, tooltip con la etiqueta, vuelve a 240/256px al expandir; sin errores de consola.
- Vista previa al pasar el cursor: con el sidebar contraído, `mouseenter` en el sidenav lo muestra completo (`iconsOnly = collapsed && !hovered`) superpuesto al contenido con `shadow-lg`; `mouseleave` lo devuelve a `sidebar.width`. El margen del contenido solo sigue a `collapsed` (no se recalcula en hover, sin reflujo). Sin transición de ancho: `updateContentMargins()` mide el drawer y una animación lo mediría a medio camino. Verificado en Chrome (fuse 80px → 240px, spark 100px → 256px; margen fijo durante el hover).
- Animación (2026-10-16): el sidenav anima `transform, width, max-width, min-width` (400ms, `cubic-bezier(0.25,0.8,0.25,1)`, la curva de Material), solo bajo `.mat-drawer-transition` para no animar el primer render y conservar el deslizamiento móvil. El margen del contenido en escritorio lo fija el layout (`contentMargin`: `sidebar.width` contraído, ancho expandido medido una vez con `afterNextRender`) y Material lo anima; ya no se llama a `updateContentMargins()` (mediría un ancho intermedio). En móvil decide Material (0). Soporta RTL (`margin-right`). Verificado en Chrome muestreando a 60/150/250/500ms: drawer y margen avanzan juntos al contraer/expandir; en hover solo el drawer; en móvil el deslizamiento sigue igual.
- Botón de contraer/expandir (2026-10-16): pasa del header al encabezado del sidebar (`AdminSidebar` emite `toggled`). Expandido: a la derecha de la marca (`flex justify-between`); contraído: encima del isotipo (`flex-col-reverse`). En móvil el header conserva su botón para abrir el sidebar (dentro del overlay, el del sidebar lo cierra). Si la config no define widgets de header, el header solo se muestra en móvil (`showHeader`), así spark no queda con una barra vacía en escritorio. Verificado en Chrome (fuse/spark, 1400px y 600px), sin errores.
- Área de usuario (2026-10-16): sale del pie y va debajo del logo, en el encabezado del sidebar. `UserMenu` pasa de `compact: boolean` a `variant: "compact" | "row" | "stacked"` (+ `tooltipPosition`, `menuXPosition`); `stacked` = avatar 48px (el doble del compacto, 24px) con nombre y email debajo; `compact` = solo avatar con tooltip "nombre · email". `IAdminUser.email` es opcional. Se quitó el `buiSidebarFooter` y sus estilos. Con el cursor, el sidebar contraído se expande (vista previa), así que el tooltip se ve sobre todo con teclado. Verificado en Chrome (fuse y spark).
