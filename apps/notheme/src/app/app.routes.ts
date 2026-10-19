import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'trabajadores',
    data: { label: 'Trabajadores', icon: 'users' },
    loadComponent: () =>
      import('./trabajador-edit/trabajador-edit').then(
        (m) => m.TrabajadorEditComponent,
      ),
  },
];
