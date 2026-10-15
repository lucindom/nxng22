import { provideIcons } from "@/app/core/icons";
import { provideLocalStorage } from "@/app/core/local-storage";
import { provideMedia } from "@/app/core/media";
import { provideMockServer } from "@/app/core/mock-server";
import { provideTheming } from "@/app/core/theming";
import { provideWindow } from "@/app/core/window";
import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MAT_TABS_CONFIG } from "@angular/material/tabs";
import { provideRouter } from "@angular/router";
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: "dynamic" },
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
      scheme: "dark",
      primary: "#3E63DD",
      error: "#E5484D",
      neutral: "#8B8D98",
    }),
    provideWindow(),
  ],
};
