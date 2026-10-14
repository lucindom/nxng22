import { Route } from "@angular/router";

export const appRoutes: Route[] = [
  {
    path: "material1",
    loadComponent: () =>
      import("./product-edit/product-edit").then((m) => m.ProductEditComponent),
  },
];