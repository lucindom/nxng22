import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
} from "@angular/core";

import { IAdminLayoutConfig } from "./models/admin-layout-config";

export const ADMIN_LAYOUT_CONFIG = new InjectionToken<IAdminLayoutConfig>(
  "ADMIN_LAYOUT_CONFIG",
);

/**
 * Registra la configuración del AdminLayout. La fábrica corre en contexto de
 * inyección, así que puede usar `inject()` para armar la configuración.
 */
export const provideAdminLayout = (
  factory: () => IAdminLayoutConfig,
): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: ADMIN_LAYOUT_CONFIG, useFactory: factory },
  ]);

export const injectAdminLayoutConfig = (): IAdminLayoutConfig => {
  const config = inject(ADMIN_LAYOUT_CONFIG, { optional: true });

  if (!config) {
    throw new Error(
      "AdminLayout necesita provideAdminLayout(() => config) en app.config.ts.",
    );
  }

  return config;
};
