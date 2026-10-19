import { NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatPseudoCheckbox } from "@angular/material/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MenuPositionX } from "@angular/material/menu";
import { MatTooltip, TooltipPosition } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { Scheme, Theming } from "@/app/core/theming";

import { IAdminUser } from "../models/admin-layout-config";

/**
 * `compact`: solo el avatar (24px) con tooltip. `row`: avatar, nombre y email
 * en fila. `stacked`: avatar al doble (48px) con nombre y email debajo.
 */
export type UserMenuVariant = "compact" | "row" | "stacked";

interface ISchemeOption {
  label: string;
  value: Scheme;
}

const SCHEMES: readonly ISchemeOption[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

/** Botón de usuario con su menú; las entradas vienen de `IAdminUser.menu`. */
@Component({
  selector: "lib-user-menu",
  imports: [
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    MatMenuModule,
    MatDividerModule,
    MatPseudoCheckbox,
    MatTooltip,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    @if (variant() === "compact") {
      <button
        matButton
        class="tiny tertiary [--button-padding-x:0.25rem] [--button-padding-y:0.25rem]"
        [matMenuTriggerFor]="userMenu"
        [matTooltip]="tooltip()"
        [matTooltipPosition]="tooltipPosition()"
      >
        <img
          class="size-6 shrink-0 overflow-hidden rounded-md object-cover"
          [class]="user().avatarClass"
          [ngSrc]="user().photo"
          width="24"
          height="24"
          [alt]="user().name"
        />
      </button>
    } @else if (variant() === "stacked") {
      <button
        matButton
        class="tertiary w-full [--button-padding-x:0.5rem] [--button-padding-y:0.5rem]"
        [matMenuTriggerFor]="userMenu"
      >
        <span class="flex min-w-0 flex-auto flex-col items-center gap-y-2">
          <img
            class="size-12 shrink-0 overflow-hidden rounded-lg object-cover"
            [class]="user().avatarClass"
            [ngSrc]="user().photo"
            width="48"
            height="48"
            [alt]="user().name"
          />
          <span class="w-full min-w-0 text-center">
            <span class="block truncate font-semibold">{{ user().name }}</span>
            @if (user().email) {
              <span class="block truncate text-sm text-neutral-a11">{{
                user().email
              }}</span>
            }
          </span>
        </span>
      </button>
    } @else {
      <button
        matButton
        class="tertiary small w-full [--button-padding-x:0.375rem] [--button-padding-y:0.375rem]"
        [matMenuTriggerFor]="userMenu"
      >
        <span class="me-2 flex min-w-0 flex-auto items-center gap-x-3">
          <img
            class="size-9 shrink-0 overflow-hidden rounded-md object-cover"
            [class]="user().avatarClass"
            [ngSrc]="user().photo"
            width="36"
            height="36"
            [alt]="user().name"
          />
          <span class="min-w-0 text-start">
            <span class="block truncate font-semibold">{{ user().name }}</span>
            @if (user().email) {
              <span class="block truncate text-sm">{{ user().email }}</span>
            }
          </span>
        </span>

        <mat-icon
          class="ms-auto me-1"
          svgIcon="ellipsis-vertical"
          iconPositionEnd
        />
      </button>
    }

    <!-- User menu -->
    <mat-menu class="min-w-52" [xPosition]="menuXPosition()" #userMenu>
      @if (user().profileInMenu) {
        <button mat-menu-item>
          <img
            class="size-9 rounded-lg object-cover"
            [src]="user().photo"
            [alt]="user().name"
          />
          <div class="ms-3 flex min-w-0 flex-auto flex-col select-none">
            <div class="truncate text-lg font-medium">{{ user().name }}</div>
            @if (user().email) {
              <div class="truncate text-sm text-neutral-a11">
                {{ user().email }}
              </div>
            }
          </div>
        </button>
      }

      @for (item of user().menu; track item.id) {
        @if (item.dividerBefore) {
          <mat-divider />
        }

        @switch (item.action) {
          @case ("scheme") {
            <button mat-menu-item [matMenuTriggerFor]="schemeMenu">
              <mat-icon [svgIcon]="item.icon" />
              <span>{{ item.label }}</span>
            </button>
          }
          @case ("signOut") {
            <button mat-menu-item (click)="signedOut.emit()">
              <mat-icon [svgIcon]="item.icon" />
              <span>{{ item.label }}</span>
            </button>
          }
          @default {
            @if (item.route) {
              <a mat-menu-item [routerLink]="item.route">
                <mat-icon [svgIcon]="item.icon" />
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <button mat-menu-item>
                <mat-icon [svgIcon]="item.icon" />
                <span>{{ item.label }}</span>
              </button>
            }
          }
        }
      }
    </mat-menu>

    <!-- Color scheme submenu -->
    <mat-menu #schemeMenu>
      @for (option of schemes; track option.value) {
        <button mat-menu-item (click)="updateScheme(option.value)">
          <mat-pseudo-checkbox
            appearance="minimal"
            [state]="
              theming.scheme() === option.value ? 'checked' : 'unchecked'
            "
          />
          <span class="ms-1">{{ option.label }}</span>
        </button>
      }
    </mat-menu>
  `,
})
export class UserMenu {
  readonly user = input.required<IAdminUser>();
  readonly variant = input<UserMenuVariant>("row");
  readonly tooltipPosition = input<TooltipPosition>("below");
  readonly menuXPosition = input<MenuPositionX>("before");
  readonly signedOut = output<void>();

  protected readonly theming = inject(Theming);
  protected readonly schemes = SCHEMES;
  protected readonly tooltip = computed(() => {
    const { name, email } = this.user();

    return email ? `${name} · ${email}` : name;
  });

  protected updateScheme(scheme: Scheme): void {
    this.theming.scheme.set(scheme);
  }
}
