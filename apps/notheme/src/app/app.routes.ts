import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'trabajadores',
    loadComponent: () =>
      import('./trabajador-edit/trabajador-edit').then(
        (m) => m.TrabajadorEditComponent,
      ),
  },
];
