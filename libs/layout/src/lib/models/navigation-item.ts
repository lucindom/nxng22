import { IsActiveMatchOptions } from "@angular/router";

export interface INavigationItem {
  id: string;
  label: string;
  section?: boolean;
  icon?: string;
  badge?: string;
  route?: string;
  routeActiveOptions?: { exact: boolean } | IsActiveMatchOptions;
  disabled?: boolean;
  expanded?: boolean;
  children?: INavigationItem[];
}

/** Datos que cada ruta puede declarar en `data` para aparecer en el sidebar. */
export interface IRouteNavigationData {
  label?: string;
  icon?: string;
  hideInSidebar?: boolean;
}
