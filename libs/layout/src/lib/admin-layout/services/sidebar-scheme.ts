import { inject, Injectable, signal } from "@angular/core";
import { LocalStorage } from "@/app/core/local-storage";

const STORAGE_KEY = "sidebarScheme";

export type SidebarScheme = "dark" | "light";

/** Esquema del sidebar, independiente del esquema general de la app. */
@Injectable({ providedIn: "root" })
export class SidebarSchemeService {
  private readonly schemeState = signal<SidebarScheme>("dark");
  readonly scheme = this.schemeState.asReadonly();

  private readonly localStorage = inject(LocalStorage);

  constructor() {
    const stored = this.localStorage.getItem(STORAGE_KEY);

    if (stored === "dark" || stored === "light") {
      this.schemeState.set(stored);
    }
  }

  setScheme(scheme: SidebarScheme): void {
    this.schemeState.set(scheme);
    this.localStorage.setItem(STORAGE_KEY, scheme);
  }
}
