import { provideIcons } from "@/app/core/icons";
import { provideLocalStorage } from "@/app/core/local-storage";
import { provideWindow } from "@/app/core/window";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideIcons(),
    provideLocalStorage(),
    provideWindow(),
  ],
};
