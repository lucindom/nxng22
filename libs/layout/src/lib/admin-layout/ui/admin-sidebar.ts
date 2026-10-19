import { NgOptimizedImage, NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  untracked,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import {
  isActive,
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
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
import {
  AdminAppearance,
  AdminBrand,
  IAdminPromo,
  IAdminUser,
} from "../models/admin-layout-config";
import { UserMenu } from "./user-menu";

/** Clases que cambian según la apariencia del layout. */
interface ISidebarStyles {
  host: string;
  aside: string;
  header: string;
  promo: string;
}

const APPEARANCE_STYLES: Record<AdminAppearance, ISidebarStyles> = {
  card: {
    host: "overflow-x-clip",
    aside: "w-auto flex-auto lg:-me-2",
    header: "flex flex-col gap-y-5 px-5.5 pb-4",
    promo: "px-3.5 pb-3 lg:pb-0",
  },
  flat: {
    host: "",
    aside: "flex-auto",
    header: "flex flex-col gap-y-4 px-5 pb-4",
    promo: "mt-4",
  },
};

/**
 * Modo contraído: solo iconos, centrados. Se apoya en los `data-slot` de las
 * directivas de BuilderKit para ocultar textos sin modificarlas.
 */
const COLLAPSED_HOST = [
  "[&_[data-slot=bui-sidebar-label]]:hidden",
  "[&_[data-slot=bui-sidebar-badge]]:hidden",
  "[&_[data-slot=bui-sidebar-section-header]]:hidden",
  "[&_[data-slot=bui-sidebar-button]]:justify-center",
  "[&_[data-slot=bui-sidebar-button]]:mx-0",
  "[&_[data-slot=bui-sidebar-button]]:px-0",
].join(" ");

const COLLAPSED_HEADER = "flex flex-col items-center gap-y-4 px-2 pb-4";
const BRAND_ROW = "flex items-center justify-between gap-x-2";
const COLLAPSED_BRAND_ROW = "flex flex-col-reverse items-center gap-y-3";

const EXACT_MATCH: IsActiveMatchOptions = {
  paths: "exact",
  queryParams: "exact",
  fragment: "ignored",
  matrixParams: "ignored",
};

const SUBSET_MATCH: IsActiveMatchOptions = {
  paths: "subset",
  queryParams: "subset",
  fragment: "ignored",
  matrixParams: "ignored",
};

@Component({
  selector: "lib-admin-sidebar",
  imports: [
    NgOptimizedImage,
    NgTemplateOutlet,
    MatButtonModule,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatTooltip,
    UserMenu,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarSection,
    BuiSidebarSectionHeader,
    BuiSidebarSectionContent,
    BuiSidebarSpacer,
    BuiCollapsible,
    BuiCollapsibleTrigger,
    BuiCollapsiblePanel,
    BuiCollapsibleContent,
    BuiSidebarButton,
    BuiSidebarLabel,
    BuiSidebarIcon,
    BuiSidebarMenu,
    BuiSidebarMenuItem,
    BuiSidebarMenuRow,
    BuiSidebarBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex w-full flex-auto flex-col",
    "[class]": "hostClass()",
  },
  template: `
    <aside buiSidebar [class]="styles().aside">
      <!-- Header -->
      <div buiSidebarHeader [class]="headerClass()">
        <!-- Expandido: marca y botón en fila. Contraído: botón sobre la marca -->
        <div [class]="brandRowClass()">
          @let currentBrand = brand();
          @if (currentBrand.kind === "mark") {
            <a
              class="inline-flex items-center gap-x-3 rounded-xl"
              routerLink="/"
            >
              <div
                class="flex size-9 items-center justify-center rounded-xl border bg-neutral-a3 p-1.5"
              >
                <img
                  [ngSrc]="currentBrand.markSrc"
                  width="32"
                  height="32"
                  [alt]="currentBrand.alt"
                />
              </div>
              @if (!collapsed()) {
                <div class="flex flex-col gap-y-0.5">
                  <div class="text-2xl leading-none font-bold tracking-tighter">
                    {{ currentBrand.title }}
                  </div>
                  @if (currentBrand.subtitle) {
                    <div
                      class="text-xs leading-none font-medium text-neutral-a10"
                    >
                      {{ currentBrand.subtitle }}
                    </div>
                  }
                </div>
              }
            </a>
          } @else if (collapsed()) {
            @if (currentBrand.markLightSrc && currentBrand.markDarkSrc) {
              <a class="inline-flex size-8" routerLink="/">
                <img
                  class="dark:hidden"
                  [ngSrc]="currentBrand.markLightSrc"
                  width="32"
                  height="32"
                  [alt]="currentBrand.alt"
                />
                <img
                  class="hidden dark:block"
                  [ngSrc]="currentBrand.markDarkSrc"
                  width="32"
                  height="32"
                  [alt]="currentBrand.alt"
                />
              </a>
            }
          } @else {
            <a class="inline-flex aspect-157/54 max-h-8" routerLink="/">
              <img
                class="dark:hidden"
                [ngSrc]="currentBrand.lightSrc"
                [width]="currentBrand.width"
                [height]="currentBrand.height"
                [alt]="currentBrand.alt"
              />
              <img
                class="hidden dark:block"
                [ngSrc]="currentBrand.darkSrc"
                [width]="currentBrand.width"
                [height]="currentBrand.height"
                [alt]="currentBrand.alt"
              />
            </a>
          }

          <button
            matIconButton
            class="shrink-0"
            [attr.aria-label]="
              collapsed() ? 'Expand sidebar' : 'Collapse sidebar'
            "
            (click)="toggled.emit()"
          >
            <mat-icon svgIcon="panel-left" />
          </button>
        </div>

        <!-- User: avatar al doble con nombre y email; contraído, solo el avatar -->
        <lib-user-menu
          tooltipPosition="right"
          menuXPosition="after"
          [class.w-full]="!collapsed()"
          [variant]="collapsed() ? 'compact' : 'stacked'"
          [user]="user()"
          (signedOut)="signedOut.emit()"
        />
      </div>

      <!-- Body -->
      <div buiSidebarBody>
        <!-- Navigation -->
        <div buiSidebarSection>
          <div buiSidebarSectionContent>
            <ul buiSidebarMenu>
              <ng-container
                [ngTemplateOutlet]="navigationTemplate"
                [ngTemplateOutletContext]="{ $implicit: items() }"
              />
            </ul>
          </div>
        </div>

        <!-- Favorites -->
        @if (showFavorites() && favorites.favorites().length) {
          <div buiSidebarSection buiCollapsible [expanded]="true">
            <div buiSidebarSectionHeader>
              <button buiSidebarButton buiCollapsibleTrigger>
                <span buiSidebarLabel class="grow-0">FAVORITES</span>
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
                            routerLinkActive="active"
                            matTooltipPosition="right"
                            [routerLink]="favorite.url"
                            [matTooltip]="favorite.label"
                            [matTooltipDisabled]="!collapsed()"
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

        <!-- Promo -->
        @if (visiblePromo(); as promo) {
          <div buiSidebarSection [class]="styles().promo">
            <div buiSidebarSectionContent>
              <div
                class="overflow-hidden rounded-xl border bg-white p-3.5 pt-4 dark:border-white-a4 dark:bg-neutral-a2"
              >
                <mat-icon class="size-5 text-primary" [svgIcon]="promo.icon" />
                <div class="mt-1.5 text-lg font-medium tracking-tight">
                  {{ promo.title }}
                </div>
                <div class="mt-0.5 text-neutral-a11">
                  {{ promo.description }}
                </div>
                <a
                  matButton
                  class="primary mt-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  [href]="promo.cta.href"
                >
                  {{ promo.cta.label }}
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </aside>

    <!-- Navigation template -->
    <ng-template let-nav #navigationTemplate>
      @for (item of asItems(nav); track item.id) {
        @if (item.section) {
          <!-- Section header -->
          <li buiSidebarSectionHeader class="mt-3 first:mt-0">
            <span buiSidebarLabel class="text-xs uppercase">{{
              item.label
            }}</span>
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
                matTooltipPosition="right"
                [matTooltip]="item.label"
                [matTooltipDisabled]="!collapsed()"
                [disabled]="item.disabled"
                [tabindex]="item.disabled ? -1 : 0"
                [attr.aria-disabled]="item.disabled"
              >
                @if (item.icon) {
                  <mat-icon buiSidebarIcon [svgIcon]="item.icon" />
                }
                <span buiSidebarLabel>{{ item.label }}</span>
                @if (!collapsed()) {
                  <mat-icon
                    buiSidebarIcon
                    svgIcon="chevron-right"
                    class="transition-[rotate]"
                    [class.rotate-90]="collapsible.expanded()"
                  />
                }
              </button>
            </div>

            <!-- Content -->
            <ng-template buiCollapsiblePanel>
              <ul buiSidebarMenu buiCollapsibleContent>
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
              <a
                buiSidebarButton
                routerLinkActive="active"
                matTooltipPosition="right"
                [routerLink]="item.route"
                [matTooltip]="item.label"
                [matTooltipDisabled]="!collapsed()"
                [routerLinkActiveOptions]="
                  item.routeActiveOptions ?? { exact: true }
                "
                [tabindex]="item.disabled ? -1 : 0"
                [attr.aria-disabled]="item.disabled"
              >
                @if (item.icon) {
                  <mat-icon buiSidebarIcon [svgIcon]="item.icon" />
                }

                <span buiSidebarLabel>{{ item.label }}</span>

                @let badge = badges()[item.id] || item.badge;
                @if (badge) {
                  <div buiSidebarBadge>{{ badge }}</div>
                }
              </a>
            </div>
          </li>
        }
      }
    </ng-template>
  `,
})
export class AdminSidebar {
  readonly appearance = input.required<AdminAppearance>();
  readonly brand = input.required<AdminBrand>();
  readonly navigation = input.required<INavigationItem[]>();
  readonly badges = input<Record<string, number | string>>({});
  readonly showFavorites = input(false, { transform: booleanAttribute });
  readonly promo = input<IAdminPromo | null>(null);
  readonly user = input.required<IAdminUser>();
  /** Solo iconos, centrados (sidebar contraído). */
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly signedOut = output<void>();
  /** Botón de contraer / expandir del encabezado. */
  readonly toggled = output<void>();

  protected readonly favorites = inject(FavoritesService);
  protected readonly styles = computed(
    () => APPEARANCE_STYLES[this.appearance()],
  );
  protected readonly hostClass = computed(() =>
    this.collapsed()
      ? `${this.styles().host} ${COLLAPSED_HOST}`
      : this.styles().host,
  );
  protected readonly brandRowClass = computed(() =>
    this.collapsed() ? COLLAPSED_BRAND_ROW : BRAND_ROW,
  );
  protected readonly headerClass = computed(() =>
    this.collapsed() ? COLLAPSED_HEADER : this.styles().header,
  );
  protected readonly visiblePromo = computed(() =>
    this.collapsed() ? null : this.promo(),
  );
  /** Navegación con las ramas de la ruta activa expandidas tras la primera navegación. */
  protected readonly items = computed(() => {
    const navigation = this.navigation();

    return this.initialNavigation()
      ? untracked(() => this.expandActiveRoute(navigation))
      : navigation;
  });

  private readonly router = inject(Router);
  private readonly initialNavigation = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      take(1),
    ),
  );

  protected asItems(navigation: unknown): INavigationItem[] {
    return navigation as INavigationItem[];
  }

  /** Expande los ancestros de la ruta activa sin mutar la navegación original. */
  private expandActiveRoute(items: INavigationItem[]): INavigationItem[] {
    return items.map((item) => {
      const children = item.children
        ? this.expandActiveRoute(item.children)
        : undefined;
      const expanded =
        !!item.expanded ||
        !!children?.some((child) => child.expanded) ||
        this.isItemActive(item);

      return { ...item, children, expanded };
    });
  }

  private isItemActive(item: INavigationItem): boolean {
    if (!item.route) {
      return false;
    }

    const options = this.toMatchOptions(
      item.routeActiveOptions ?? { exact: true },
    );

    return isActive(item.route, this.router, options)();
  }

  /** Convierte la opción simple `exact` en `IsActiveMatchOptions`. */
  private toMatchOptions(
    options: { exact: boolean } | IsActiveMatchOptions,
  ): IsActiveMatchOptions {
    if (!("exact" in options)) {
      return options;
    }

    return options.exact ? EXACT_MATCH : SUBSET_MATCH;
  }
}
