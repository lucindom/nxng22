import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { LocalStorage } from "@/app/core/local-storage";

const STORAGE_KEY = "favorites";

export interface IFavorite {
  url: string;
  label: string;
  icon?: string;
}

@Injectable({ providedIn: "root" })
export class FavoritesService {
  private readonly items = signal<IFavorite[]>([]);
  readonly favorites = this.items.asReadonly();

  private readonly localStorage = inject(LocalStorage);
  private readonly router = inject(Router);

  constructor() {
    this.items.set(this.restoreFavorites());
  }

  isFavorite(url: string): boolean {
    const path = this.toPath(url);

    return this.items().some((item) => this.toPath(item.url) === path);
  }

  toggleFavorite(favorite: IFavorite): void {
    const path = this.toPath(favorite.url);

    this.items.update((items) =>
      items.some((item) => this.toPath(item.url) === path)
        ? items.filter((item) => this.toPath(item.url) !== path)
        : [...items, { ...favorite, url: path }],
    );

    this.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }

  private restoreFavorites(): IFavorite[] {
    const stored = this.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as IFavorite[];
    } catch {
      return [];
    }
  }

  private toPath(url: string): string {
    const tree = this.router.parseUrl(url);
    tree.queryParams = {};
    tree.fragment = null;

    return this.router.serializeUrl(tree);
  }
}
