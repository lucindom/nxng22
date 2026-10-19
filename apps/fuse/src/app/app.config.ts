import { provideIcons } from "@/app/core/icons";
import { provideLocalStorage } from "@/app/core/local-storage";
import { provideMedia } from "@/app/core/media";
import { provideMockServer } from "@/app/core/mock-server";
import { provideTheming } from "@/app/core/theming";
import { provideViewportScroller } from "@/app/core/viewport-scroller";
import { provideWindow } from "@/app/core/window";
import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideDateFnsAdapter } from "@angular/material-date-fns-adapter";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from "@angular/material/progress-spinner";
import { MAT_TABS_CONFIG } from "@angular/material/tabs";
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from "@angular/router";
import { provideAdminLayout } from "@nx-ng-v22/layout";
import { enUS } from "date-fns/locale";
import { appRoutes } from "./app.routes";
import { fuseLayoutConfig } from "./layout/fuse-layout.config";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: "enabled" }),
    ),
    provideAdminLayout(fuseLayoutConfig),
    provideHttpClient(),
    { provide: MAT_DATE_LOCALE, useValue: enUS },
    provideDateFnsAdapter({
      parse: { dateInput: "P", timeInput: "p" },
      display: {
        dateInput: "eee MMM d, yyyy",
        timeInput: "p",
        monthYearLabel: "LLL uuuu",
        dateA11yLabel: "PP",
        monthYearA11yLabel: "LLLL uuuu",
        timeOptionLabel: "p",
      },
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: "dynamic" },
    },
    {
      provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
      useValue: { diameter: 32 },
    },
    { provide: MAT_TABS_CONFIG, useValue: { stretchTabs: false } },
    provideMockServer({
      baseURL: "https://mock.server",
      delay: 0,
      logging: { handler: true, bypass: false },
    }),
    provideIcons(),
    provideLocalStorage(),
    provideMedia(),
    provideTheming({
      scheme: "light",
      primary: "#26334a", // azul oscuro ems (ems-dark-blue 500)
      error: "#f5365c", // rojo ems
      neutral: "#8B8D98", // gris neutro (default de Core)
      accent: "#34c7d6", // amarillo ems (ejemplo)
    }),
    provideViewportScroller(),
    provideWindow(),
  ],
};
