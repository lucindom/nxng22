# Componente material1 en fuse

Objetivo: en `fuse`, componente con 3 mat-form-field (nombre, descripcion max 4 lineas, encargado con mat-autocomplete de >=10 nombres), boton Guardar que abre un mat-dialog (mat-toolbar con titulo y cerrar, mensaje con el nombre, acciones Save/Cancelar). Ruta `/material1`, visible en el sidebar (menu recibido por input) con la opcion activa resaltada.

## Archivos afectados
- libs/layout: sidebar.ts, models/sidebar-menu-item.ts, index.ts
- apps/fuse: app.ts, app.html, app.routes.ts, nuevo `material1/` (componente + dialog)

## Pasos
- [x] 1. Sidebar: input `menu` (ISidebarMenuItem[]), routerLink + routerLinkActive (opcion activa)
- [x] 2. fuse: pasar el menu al sidebar desde app.ts / app.html
- [x] 3. Componente Material1 (formulario tipado, autocomplete con 10 nombres)
- [x] 4. Dialog de confirmacion (mat-toolbar, Save/Cancelar)
- [x] 5. Ruta `/material1` (lazy) en app.routes.ts

## Decisiones
- @angular/material y cdk 22.2.2 ya estan en package.json.
- Se elimina el link "Dashboard" (#) hardcodeado: el menu ahora lo define la app.
- Tema: se agrego el prebuilt-theme azure-blue en project.json (styles.css no puede usar los mixins Sass de Material).
- Archivos nuevos en apps/fuse/src/app/material1/: material1.ts/.html, confirm-save-dialog.ts/.html.
