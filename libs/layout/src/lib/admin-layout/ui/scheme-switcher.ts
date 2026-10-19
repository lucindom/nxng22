import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { Theming } from "@/app/core/theming";

/** Alterna entre esquema claro y oscuro. */
@Component({
  selector: "lib-scheme-switcher",
  imports: [MatIconButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button matIconButton (click)="toggle()">
      <mat-icon [svgIcon]="theming.isDark() ? 'sun' : 'moon'" />
    </button>
  `,
})
export class SchemeSwitcher {
  protected readonly theming = inject(Theming);

  protected toggle(): void {
    this.theming.scheme.set(this.theming.isDark() ? "light" : "dark");
  }
}
