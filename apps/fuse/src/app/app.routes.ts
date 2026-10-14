import { Route } from "@angular/router";

export const appRoutes: Route[] = [
  {
    path: "material1",
    loadComponent: () =>
      import("./material1/material1").then((m) => m.Material1Component),
  },
];