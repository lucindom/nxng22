import { Directionality } from "@angular/cdk/bidi";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { isPlatformBrowser, NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from "@angular/material/sidenav";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { AuthService } from "@nx-ng-v22/core";
import { filter } from "rxjs";
import { Media } from "@/app/core/media";
import { Theming } from "@/app/core/theming";
import { BuiScrollViewport } from "@/app/core/viewport-scroller";

import { RouteNavigation } from "../services/route-navigation";
import { injectAdminLayoutConfig } from "./admin-layout.token";
import { AdminAppearance } from "./models/admin-layout-config";
import { SidebarSchemeService } from "./services/sidebar-scheme";
import { ActionPanel } from "./ui/action-panel";
import { AdminSidebar } from "./ui/admin-sidebar";
import { NotificationsMenu } from "./ui/notifications-menu";
import { QuickSettings } from "./ui/quick-settings";
import { SchemeSwitcher } from "./ui/scheme-switcher";
import { UserMenu } from "./ui/user-menu";

/** Clases que cambian según la apariencia del layout. */
interface ILayoutStyles {
  container: string;
  sidenav: string;
  /** Ancho del sidenav expandido; contraído lo fija `sidebar.width`. */
  sidenavWidth: string;
  content: string;
  panel: string;
  header: string;
}

const LAYOUT_STYLES: Record<AdminAppearance, ILayoutStyles> = {
  card: {
    container: "flex-auto overflow-clip print:overflow-visible",
    sidenav: "border-none print:hidden",
    sidenavWidth: "w-60",
    content:
      "min-w-0 overflow-clip bg-transparent lg:h-dvh lg:p-2 print:ms-0 print:h-auto print:overflow-visible",
    panel:
      "flex flex-auto flex-col bg-white shadow-xs lg:overflow-y-auto lg:rounded-lg lg:ring-1 lg:ring-neutral-a3 dark:bg-neutral-2 print:overflow-visible print:shadow-none",
    header:
      "sticky top-0 z-99 flex items-center gap-x-2 border-b bg-white py-3 ps-4 pe-5 dark:bg-neutral-2 print:hidden",
  },
  flat: {
    container: "flex-auto",
    sidenav: "",
    sidenavWidth: "",
    content: "overflow-hidden",
    panel: "flex flex-auto flex-col",
    header: "flex items-center gap-x-4 border-b px-6 py-4",
  },
};

/**
 * Animación del ancho del sidenav (contraer, expandir y vista previa), con la
 * misma duración y curva que Material usa para abrirlo. Solo tras el primer
 * render: Material añade `mat-drawer-transition` al contenedor cuando ya está
 * listo, y `transform` se conserva para la animación de apertura en móvil.
 */
const SIDENAV_TRANSITION = [
  "in-[.mat-drawer-transition]:transition-[transform,width,max-width,min-width]",
  "in-[.mat-drawer-transition]:duration-400",
  "in-[.mat-drawer-transition]:ease-[cubic-bezier(0.25,0.8,0.25,1)]",
].join(" ");

/** Ancho del sidebar contraído cuando la config no define `sidebar.width`. */
const DEFAULT_COLLAPSED_WIDTH = "100px";

/**
 * Shell de administración: sidenav con el sidebar, header y contenido. Se
 * configura con `provideAdminLayout()` y se monta como componente de ruta.
 */
@Component({
  selector: "lib-admin-layout",
  imports: [
    NgTemplateOutlet,
    MatIcon,
    MatIconButton,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    RouterOutlet,
    CdkScrollable,
    BuiScrollViewport,
    AdminSidebar,
    UserMenu,
    ActionPanel,
    NotificationsMenu,
    QuickSettings,
    SchemeSwitcher,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex min-h-full w-full flex-auto flex-col",
  },
  template: `
    <mat-sidenav-container
      [class]="styles.container"
      [class.scheme-dark]="darkSidebar()"
    >
      <mat-sidenav
        autoFocus="a.active"
        fixedInViewport
        [class]="sidenavClass()"
        [class.shadow-lg]="peeking()"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [disableClose]="!isMobile()"
        [style.width]="iconsOnly() ? collapsedWidth : null"
        (mouseenter)="hovered.set(true)"
        (mouseleave)="hovered.set(false)"
        (openedStart)="centerActiveLink()"
        #sidenav
      >
        <lib-admin-sidebar
          [appearance]="config.appearance"
          [brand]="config.brand"
          [navigation]="navigation"
          [badges]="badges()"
          [showFavorites]="config.sidebar.favorites"
          [promo]="config.sidebar.promo"
          [user]="config.user"
          [collapsed]="iconsOnly()"
          (signedOut)="signOut()"
          (toggled)="toggleSidebar()"
        />
      </mat-sidenav>

      <mat-sidenav-content
        [class]="styles.content"
        [style.margin-left]="isRtl ? null : contentMargin()"
        [style.margin-right]="isRtl ? contentMargin() : null"
        [class.scheme-light]="!theming.isDark()"
      >
        @if (config.appearance === "card") {
          <!-- El panel es la región con scroll: se registra para restaurarlo -->
          <div cdkScrollable buiScrollViewport [class]="styles.panel">
            <ng-container [ngTemplateOutlet]="body" />
          </div>
        } @else {
          <div [class]="styles.panel">
            <ng-container [ngTemplateOutlet]="body" />
          </div>
        }

        <ng-template #body>
          <!-- Header (en escritorio el botón del sidebar vive en su encabezado) -->
          @if (showHeader()) {
            <div [class]="styles.header">
              @if (isMobile()) {
                <button
                  matIconButton
                  aria-label="Open sidebar"
                  (click)="toggleSidebar()"
                >
                  <mat-icon svgIcon="panel-left" />
                </button>
              }

              <div class="flex-auto"></div>

              @if (config.header.quickSettings; as quickSettings) {
                <lib-quick-settings
                  [themePresets]="quickSettings.themePresets"
                  [sidebarScheme]="config.sidebar.darkScheme"
                />
              }

              @if (config.header.schemeSwitcher) {
                <lib-scheme-switcher />
              }

              @if (config.header.search; as search) {
                <lib-action-panel compact [data]="search" />
              }

              @if (config.header.notifications; as notifications) {
                <lib-notifications-menu [config]="notifications" />
              }

              @if (config.header.user) {
                <lib-user-menu
                  variant="compact"
                  class="lg:hidden"
                  [user]="config.user"
                  (signedOut)="signOut()"
                />
              }
            </div>
          }

          <!-- Content -->
          <div class="flex flex-auto flex-col">
            <router-outlet />
          </div>
        </ng-template>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminLayout {
  readonly sidenav = viewChild.required<MatSidenav>("sidenav");

  protected readonly config = injectAdminLayoutConfig();
  protected readonly styles = LAYOUT_STYLES[this.config.appearance];
  protected readonly theming = inject(Theming);
  protected readonly isMobile = inject(Media).match(
    this.config.mobileBreakpoint,
  );
  protected readonly navigation =
    this.config.navigation ?? inject(RouteNavigation).build();
  protected readonly badges = computed(
    () => this.config.navigationBadges?.() ?? {},
  );
  /** Cursor sobre el sidebar. */
  protected readonly hovered = signal(false);
  protected readonly collapsedWidth =
    this.config.sidebar.width ?? DEFAULT_COLLAPSED_WIDTH;
  /** Sidebar contraído a solo iconos (únicamente en escritorio). */
  protected readonly collapsed = computed(
    () => this.collapsedState() && !this.isMobile(),
  );
  /** Sidebar contraído con el cursor encima: se muestra completo sobre el contenido. */
  protected readonly peeking = computed(
    () => this.collapsed() && this.hovered(),
  );
  /** Lo que se dibuja: solo iconos mientras está contraído y sin cursor encima. */
  protected readonly iconsOnly = computed(
    () => this.collapsed() && !this.hovered(),
  );
  protected readonly sidenavClass = computed(() =>
    this.iconsOnly()
      ? `${this.styles.sidenav} ${SIDENAV_TRANSITION}`
      : `${this.styles.sidenav} ${this.styles.sidenavWidth} ${SIDENAV_TRANSITION}`,
  );
  /**
   * Margen del contenido en escritorio: el ancho de la config contraído o el
   * ancho expandido medido al iniciar. Se fija aquí en vez de dejar que
   * Material mida el drawer, porque durante la animación mediría un ancho
   * intermedio; Material ya anima `margin-left/right`. La vista previa (hover)
   * no lo cambia: se superpone al contenido. En móvil (`over`) decide Material.
   */
  protected readonly contentMargin = computed(() => {
    if (this.isMobile()) {
      return null;
    }

    return this.collapsed() ? this.collapsedWidth : this.expandedWidth();
  });
  /** Sin widgets, el header solo hace falta en móvil (botón para abrir el sidebar). */
  protected readonly showHeader = computed(
    () => this.hasHeaderWidgets || this.isMobile(),
  );
  protected readonly isRtl = inject(Directionality).value === "rtl";
  protected readonly darkSidebar = computed(
    () =>
      this.config.sidebar.darkScheme && this.sidebarScheme.scheme() === "dark",
  );

  private readonly collapsedState = signal(false);
  /** Hay algún widget configurado en el header. */
  private readonly hasHeaderWidgets = Object.values(this.config.header).some(
    Boolean,
  );
  /** Ancho del sidenav expandido (`w-60` o el de Material), medido una vez. */
  private readonly expandedWidth = signal<string | null>(null);
  private readonly sidenavElement = viewChild.required("sidenav", {
    read: ElementRef<HTMLElement>,
  });
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly authService = inject(AuthService);
  private readonly sidebarScheme = inject(SidebarSchemeService);
  private readonly navigationEnd = toSignal(
    inject(Router).events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ),
  );

  constructor() {
    afterNextRender(() => {
      const width = this.sidenavElement().nativeElement.offsetWidth;
      this.expandedWidth.set(`${width}px`);
    });

    // Close the sidenav after navigating (mobile only)
    effect(() => {
      if (!this.navigationEnd()) {
        return;
      }

      untracked(() => {
        if (this.isMobile()) {
          this.sidenav().toggle(false);
        }
      });
    });
  }

  /** En escritorio contrae o expande el sidebar; en móvil lo abre o cierra. */
  protected toggleSidebar(): void {
    if (this.isMobile()) {
      this.sidenav().toggle();
      return;
    }

    this.collapsedState.update((collapsed) => !collapsed);
  }

  protected centerActiveLink(): void {
    // The server DOM has no scrollIntoView
    if (!this.isBrowser) {
      return;
    }

    this.sidenavElement()
      .nativeElement.querySelector("a.active")
      ?.scrollIntoView({ block: "center" });
  }

  protected signOut(): void {
    if (this.config.onSignOut) {
      this.config.onSignOut();
      return;
    }

    this.authService.logout();
  }
}
