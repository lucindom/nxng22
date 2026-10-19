import { Route } from "@angular/router";
import { AdminLayout } from "@nx-ng-v22/layout";

export const appRoutes: Route[] = [
  {
    path: "",
    component: AdminLayout,
    children: [
      { path: "", pathMatch: "full", redirectTo: "material1" },
      {
        path: "material1",
        data: { label: "Edición de Productos", icon: "package" },
        loadComponent: () =>
          import("./product-edit/product-edit").then(
            (m) => m.ProductEditComponent,
          ),
      },
    ],
  },
];
