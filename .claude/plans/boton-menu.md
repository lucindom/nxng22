# boton-menu (libs/ui)

## Objetivo
Componente reutilizable `lib-boton-menu` en `libs/ui`: botón de Angular Material que abre un
`mat-menu` con las opciones Guardar / Borrar / Cancelar.

## Archivos
- `libs/ui/src/lib/common/boton-menu/boton-menu.component.ts`
- `libs/ui/src/lib/common/boton-menu/boton-menu.component.html`
- `libs/ui/src/index.ts` (export)
- `libs/ui/package.json` (peerDependency `@angular/material`)

## Pasos
- [x] Crear componente (OnPush, `input`/`output` signals)
- [x] Exportar desde `@nx-ng-v22/ui`
- [x] Agregar `@angular/material` a peerDependencies (requerido por `@nx/dependency-checks`)
- [x] `type="button"` en trigger e items (dentro de un `<form>` el trigger disparaba submit)
- [x] Usarlo en `apps/fuse/.../material1`: `(accionSeleccionada)` → mapa `accionesMenu`
      (guardar → `save()`, borrar → `form.reset()`, cancelar → solo cierra el menú). `OnPush` agregado.
- [ ] (Opcional) Spec

## Decisiones
- API: `etiqueta = input("Acciones")`, `accionSeleccionada = output<BotonMenuAccion>()`.
  El componente solo presenta y emite; la lógica de cada acción queda en el consumidor (SRP).
- Opciones en constante tipada `OPCIONES_MENU` + `@for` con `track`, en vez de 3 botones repetidos.
- Iconos con `fontSet="material-symbols-outlined"`, como en `confirm-save-dialog`.

## Pendientes / riesgos
- ~~`libs/ui/src/lib/ui/ui.ts` referencia `ui.html` / `ui.css` inexistentes~~ → resuelto: el usuario
  eliminó el placeholder `Ui` (no tenía usos) y su export.

## ConfirmSaveDialog compartido
- [x] Movido a `libs/ui/src/lib/shared/components/confirm-save-dialog/` (`lib-confirm-save-dialog`), exportado desde `@nx-ng-v22/ui`.
- [x] Inputs signal: `name`, `entity`, `title`, `confirmLabel`, `cancelLabel`; outputs: `confirmed`, `cancelled`.
      Con `MatDialog.open(..., { data })` los valores de `data` mandan sobre los inputs; cierra con `true`/`false`.
- [x] Eliminadas las copias en `apps/fuse/.../material1` y `apps/spark/.../product-edit`; ambas usan el compartido (`entity` = "la aplicación" / "el producto").
- Nota: el botón de confirmar pasó de "Save" a "Guardar" (default de `confirmLabel`).
