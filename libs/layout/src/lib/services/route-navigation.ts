import { inject, Injectable } from "@angular/core";
import { Route, Router } from "@angular/router";

import {
  INavigationItem,
  IRouteNavigationData,
} from "../models/navigation-item";

/** Construye el árbol de navegación del sidebar a partir de las rutas de la app. */
@Injectable({ providedIn: "root" })
export class RouteNavigation {
  private readonly router = inject(Router);

  build(
    routes: Route[] = this.router.config,
    parentPath = "",
  ): INavigationItem[] {
    return routes.flatMap((route) => this.toItems(route, parentPath));
  }

  private toItems(route: Route, parentPath: string): INavigationItem[] {
    // Las rutas sin path que agrupan hijos (p. ej. el layout) no son entradas:
    // sus hijos se publican como si colgaran del padre.
    if (this.isLayoutRoute(route)) {
      return this.build(route.children ?? [], parentPath);
    }

    return this.isNavigable(route) ? [this.toItem(route, parentPath)] : [];
  }

  private isLayoutRoute(route: Route): boolean {
    return route.path === "" && !!route.children?.length;
  }

  private isNavigable(route: Route): boolean {
    const data = route.data as IRouteNavigationData | undefined;

    return (
      !!route.path &&
      !route.path.includes("*") &&
      !route.path.includes(":") &&
      !data?.hideInSidebar
    );
  }

  private toItem(route: Route, parentPath: string): INavigationItem {
    const data = route.data as IRouteNavigationData | undefined;
    const path = `${parentPath}/${route.path}`;
    const children = route.children ? this.build(route.children, path) : [];
    const title = typeof route.title === "string" ? route.title : undefined;

    return {
      id: path,
      label: data?.label ?? title ?? route.path ?? path,
      icon: data?.icon,
      route: path,
      routeActiveOptions: { exact: children.length === 0 },
      children: children.length ? children : undefined,
    };
  }
}
