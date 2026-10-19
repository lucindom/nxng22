import { NgTemplateOutlet } from "@angular/common";
import { Component, effect, inject, signal, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIcon } from "@angular/material/icon";
import {
  isActive,
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { AuthService } from "@nx-ng-v22/core";
import { filter, take } from "rxjs";
import {
  BuiCollapsible,
  BuiCollapsibleContent,
  BuiCollapsiblePanel,
  BuiCollapsibleTrigger,
} from "@/app/ui/collapsible";
import {
  BuiSidebar,
  BuiSidebarBadge,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarFooter,
  BuiSidebarHeader,
  BuiSidebarIcon,
  BuiSidebarLabel,
  BuiSidebarMenu,
  BuiSidebarMenuItem,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
  BuiSidebarSectionHeader,
  BuiSidebarSpacer,
} from "@/app/ui/sidebar";

import { INavigationItem } from "../../models/navigation-item";
import { FavoritesService } from "../../services/favorites";
import { RouteNavigation } from "../../services/route-navigation";

@Component({
  selector: "lib-sidebar",
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
    NgTemplateOutlet,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarSection,
    BuiSidebarSectionHeader,
    BuiSidebarSectionContent,
    BuiSidebarSpacer,
    BuiCollapsible,
    BuiCollapsibleTrigger,
    BuiSidebarButton,
    BuiSidebarLabel,
    BuiSidebarIcon,
    BuiCollapsiblePanel,
    BuiCollapsibleContent,
    BuiSidebarMenu,
    BuiSidebarMenuItem,
    BuiSidebarMenuRow,
    BuiSidebarBadge,
    BuiSidebarFooter,
  ],
  host: {
    class: "flex w-[250px] flex-none flex-col overflow-x-clip",
  },
  template: `
    <aside
      buiSidebar
      class="w-auto flex-auto lg:-me-2"
    >
      <!-- Header -->
      <div
        buiSidebarHeader
        class="flex flex-col gap-y-5 px-5.5 pb-4"
      >
        <a
          class="inline-flex items-center gap-x-3 rounded-xl"
          routerLink="/"
        >
          <div
            class="flex size-9 items-center justify-center rounded-xl border bg-neutral-a3 p-1.5"
          >
            <mat-icon svgIcon="blocks" />
          </div>
          <div class="text-2xl leading-none font-bold tracking-tighter">
            Menú
          </div>
        </a>
      </div>

      <!-- Body -->
      <div buiSidebarBody>
        <!-- Navigation -->
        <div buiSidebarSection>
          <div buiSidebarSectionContent>
            <ul buiSidebarMenu>
              <ng-container
                [ngTemplateOutlet]="navigationTemplate"
                [ngTemplateOutletContext]="{ $implicit: navigation() }"
              />
            </ul>
          </div>
        </div>

        <!-- Favorites -->
        @if (favorites.favorites().length) {
          <div
            buiSidebarSection
            buiCollapsible
            [expanded]="true"
          >
            <div buiSidebarSectionHeader>
              <button
                buiSidebarButton
                buiCollapsibleTrigger
              >
                <span
                  buiSidebarLabel
                  class="grow-0"
                  >FAVORITES</span
                >
                <mat-icon
                  buiSidebarIcon
                  svgIcon="chevron-right"
                  class="size-4 transition-[rotate] group-data-[state=open]/bui-collapsible:rotate-90"
                />
              </button>
            </div>

            <ng-template buiCollapsiblePanel>
              <div buiCollapsibleContent>
                <div buiSidebarSectionContent>
                  <ul buiSidebarMenu>
                    @for (
                      favorite of favorites.favorites();
                      track favorite.url
                    ) {
                      <li buiSidebarMenuItem>
                        <div buiSidebarMenuRow>
                          <a
                            buiSidebarButton
                            [routerLink]="favorite.url"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{
                              paths: 'exact',
                              queryParams: 'ignored',
                              matrixParams: 'ignored',
                              fragment: 'ignored',
                            }"
                          >
                            <mat-icon
                              buiSidebarIcon
                              [svgIcon]="favorite.icon ?? 'star'"
                            />
                            <span buiSidebarLabel>{{ favorite.label }}</span>
                          </a>
                        </div>
                      </li>
                    }
                  </ul>
                </div>
              </div>
            </ng-template>
          </div>
        }

        <!-- Spacer -->
        <div buiSidebarSpacer></div>
      </div>

      <!-- Footer -->
      <div
        buiSidebarFooter
        class="flex flex-col gap-y-2 p-4"
      >
        <p class="text-sm">
          Estado:
          {{ authService.isAuthenticated() ? "Sesión Activa" : "Invitado" }}
        </p>
        @if (authService.isAuthenticated()) {
          <button (click)="logout()">Cerrar Sesión</button>
        } @else {
          <button (click)="login()">Simular Login</button>
        }
      </div>
    </aside>

    <!-- Navigation template -->
    <ng-template
      let-nav
      #navigationTemplate
    >
      <!-- Typecast the navigation -->
      @let navigation = asNavigation(nav);

      @for (item of navigation; track item.id) {
        @if (item.section) {
          <!-- Section header -->
          <li
            buiSidebarSectionHeader
            class="mt-3 first:mt-0"
          >
            <span
              buiSidebarLabel
              class="text-xs uppercase"
              >{{ item.label }}</span
            >
          </li>

          <!-- Section items -->
          <ng-container
            [ngTemplateOutlet]="navigationTemplate"
            [ngTemplateOutletContext]="{ $implicit: item.children }"
          />
        } @else if (item.children && item.children.length) {
          <!-- Collapsible -->
          <li
            buiSidebarMenuItem
            buiCollapsible
            [expanded]="item.expanded ?? false"
            [class.opacity-50]="item.disabled"
            [class.pointer-events-none]="item.disabled"
            #collapsible="buiCollapsible"
          >
            <div buiSidebarMenuRow>
              <!-- Trigger -->
              <button
                buiSidebarButton
                buiCollapsibleTrigger
                [disabled]="item.disabled"
                [tabindex]="item.disabled ? -1 : 0"
                [attr.aria-disabled]="item.disabled"
              >
                @if (item.icon) {
                  <mat-icon
                    buiSidebarIcon
                    [svgIcon]="item.icon"
                  />
                }
                <span buiSidebarLabel>{{ item.label }}</span>
                <mat-icon
                  buiSidebarIcon
                  svgIcon="chevron-right"
                  class="transition-[rotate]"
                  [class.rotate-90]="collapsible.expanded()"
                />
              </button>
            </div>

            <!-- Content -->
            <ng-template buiCollapsiblePanel>
              <ul
                buiSidebarMenu
                buiCollapsibleContent
              >
                <ng-container
                  [ngTemplateOutlet]="navigationTemplate"
                  [ngTemplateOutletContext]="{ $implicit: item.children }"
                />
              </ul>
            </ng-template>
          </li>
        } @else {
          <!-- Menu item -->
          <li
            buiSidebarMenuItem
            [class.opacity-50]="item.disabled"
            [class.pointer-events-none]="item.disabled"
          >
            <div buiSidebarMenuRow>
              <!-- Link -->
              <a
                buiSidebarButton
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="
                  item.routeActiveOptions ?? { exact: true }
                "
                [tabindex]="item.disabled ? -1 : 0"
                [attr.aria-disabled]="item.disabled"
              >
                <!-- Icon -->
                @if (item.icon) {
                  <mat-icon
                    buiSidebarIcon
                    [svgIcon]="item.icon"
                  />
                }

                <!-- Label -->
                <span buiSidebarLabel>{{ item.label }}</span>

                <!-- Badge -->
                @if (item.badge) {
                  <div buiSidebarBadge>{{ item.badge }}</div>
                }
              </a>
            </div>
          </li>
        }
      }
    </ng-template>
  `,
})
export class SidebarComponent {
  protected authService = inject(AuthService);
  protected favorites = inject(FavoritesService);
  protected navigation = signal<INavigationItem[]>([]);

  private router = inject(Router);
  private routeNavigation = inject(RouteNavigation);
  private navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      take(1),
    ),
  );

  constructor() {
    this.navigation.set(this.routeNavigation.build());

    // Expand active route on initial load
    effect(() => {
      const navigationEnd = this.navigationEnd();
      if (!navigationEnd) {
        return;
      }

      untracked(() => {
        this.navigation.update((nav) => this.expandActiveRoute(nav));
      });
    });
  }

  login(): void {
    this.authService.login("xyz123_token_ejemplo");
  }

  logout(): void {
    this.authService.logout();
  }

  /**
   * Expand all parent routes of the active route.
   * @param items
   */
  expandActiveRoute(items: INavigationItem[]): INavigationItem[] {
    return items.map((item) => {
      if (item.children?.length) {
        item.children = this.expandActiveRoute(item.children);

        if (item.children.some((child) => child.expanded)) {
          item.expanded = true;
        }
      }

      if (
        item.route &&
        isActive(
          item.route,
          this.router,
          this.isActiveOption(item.routeActiveOptions ?? { exact: true }),
        )()
      ) {
        item.expanded = true;
      }

      return item;
    });
  }

  /**
   * Convert simple exact option to full IsActiveMatchOptions.
   * @param options
   */
  isActiveOption(
    options: { exact: boolean } | IsActiveMatchOptions,
  ): IsActiveMatchOptions {
    if ("exact" in options) {
      return options.exact
        ? {
            paths: "exact",
            queryParams: "exact",
            fragment: "ignored",
            matrixParams: "ignored",
          }
        : {
            paths: "subset",
            queryParams: "subset",
            fragment: "ignored",
            matrixParams: "ignored",
          };
    }

    return options;
  }

  protected asNavigation(navigation: unknown): INavigationItem[] {
    return navigation as INavigationItem[];
  }
}
