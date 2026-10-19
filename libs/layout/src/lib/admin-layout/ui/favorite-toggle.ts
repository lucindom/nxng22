import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs";

import { FavoritesService } from "../../services/favorites";

/** Marca o desmarca como favorita la página actual. */
@Component({
  selector: "lib-favorite-toggle",
  imports: [MatIconButton, MatIcon, MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      matIconButton
      class="tiny"
      [matTooltip]="tooltip()"
      (click)="toggle()"
    >
      <mat-icon [class]="iconClass()" svgIcon="star" />
    </button>
  `,
})
export class FavoriteToggle {
  readonly label = input.required<string>();
  readonly icon = input<string>();

  protected readonly tooltip = computed(() =>
    this.isFavorite() ? "Remove from favorites" : "Add to favorites",
  );
  protected readonly iconClass = computed(() =>
    this.isFavorite() ? "text-amber-a10" : "text-neutral-a8",
  );

  private readonly router = inject(Router);
  private readonly favorites = inject(FavoritesService);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  private readonly isFavorite = computed(() =>
    this.favorites.isFavorite(this.url()),
  );

  protected toggle(): void {
    this.favorites.toggleFavorite({
      url: this.url(),
      label: this.label(),
      icon: this.icon(),
    });
  }
}
