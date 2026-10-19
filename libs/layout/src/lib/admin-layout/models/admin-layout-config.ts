import { Signal } from "@angular/core";

import { INavigationItem } from "../../models/navigation-item";

/** `card`: contenido en tarjeta con header sticky. `flat`: contenido plano. */
export type AdminAppearance = "card" | "flat";

/** Marca con logomark y textos (fuse). */
export interface IAdminMarkBrand {
  kind: "mark";
  alt: string;
  markSrc: string;
  title: string;
  subtitle?: string;
}

/** Marca con un logo para tema claro y otro para oscuro (spark). */
export interface IAdminLogoBrand {
  kind: "logo";
  alt: string;
  lightSrc: string;
  darkSrc: string;
  width: number;
  height: number;
  /** Isotipo cuadrado (claro / oscuro) para el sidebar contraído. */
  markLightSrc?: string;
  markDarkSrc?: string;
}

export type AdminBrand = IAdminMarkBrand | IAdminLogoBrand;

/** Tarjeta promocional del pie del sidebar. */
export interface IAdminPromo {
  icon: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}

/** Entrada del menú de usuario. `scheme` abre el submenú de esquema de color. */
export interface IUserMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: "signOut" | "scheme";
  dividerBefore?: boolean;
}

export interface IAdminUser {
  name: string;
  email?: string;
  photo: string;
  /** Clases extra para el avatar (por ejemplo `grayscale`). */
  avatarClass?: string;
  /** Muestra el perfil como primer elemento del menú. */
  profileInMenu?: boolean;
  menu: IUserMenuItem[];
}

export interface INotificationAction {
  label: string;
  value: string;
  variant?: string;
}

export interface INotification {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  actor: { name: string; photo?: string } | null;
  actions?: INotificationAction[];
  mention: boolean;
  read: boolean;
  /** Ruta a la que lleva la notificación al abrirla. */
  link?: string[];
}

/** Origen de las notificaciones: la app decide de dónde salen. */
export interface INotificationsSource {
  notifications: Signal<INotification[]>;
  markAllRead(): void;
  markRead(id: string): void;
  resolve(id: string): void;
}

/** Notificaciones del header y las rutas opcionales de sus enlaces. */
export interface INotificationsConfig {
  source: INotificationsSource;
  settingsRoute?: string;
  viewAllRoute?: string;
}

export interface ISearchUser {
  id: string;
  name: string;
  email: string;
  photo: string | null;
}

export interface ISearchProject {
  id: string;
  label: string;
  colorClass: string;
}

export interface ISearchData {
  users: ISearchUser[];
  projects: ISearchProject[];
}

export interface IThemePreset {
  primary: { name: string; value: string };
  neutral: { name: string; value: string; chipClass: string };
}

/**
 * Widgets del header. Un widget con datos (`search`, `notifications`,
 * `quickSettings`) se muestra cuando la app los provee.
 */
export interface IAdminHeader {
  schemeSwitcher: boolean;
  /** Usuario compacto en el header (visible solo en móvil). */
  user: boolean;
  search?: ISearchData;
  notifications?: INotificationsConfig;
  quickSettings?: { themePresets: IThemePreset[] };
}

export interface IAdminSidebar {
  favorites: boolean;
  /** Permite sidebar oscuro en tema claro (`SidebarSchemeService`). */
  darkScheme: boolean;
  promo: IAdminPromo | null;
  /**
   * Ancho del sidebar contraído, que solo muestra los iconos. El botón del
   * header alterna entre este ancho y el completo. Por defecto `100px`.
   */
  width?: string;
}

export interface IAdminLayoutConfig {
  appearance: AdminAppearance;
  /** Media query bajo la cual el sidenav pasa a modo `over`. */
  mobileBreakpoint: string;
  brand: AdminBrand;
  /** Si se omite, el sidebar se arma con las rutas de la app. */
  navigation?: INavigationItem[];
  /** Insignias del sidebar por `id` de la entrada de navegación. */
  navigationBadges?: Signal<Record<string, number | string>>;
  header: IAdminHeader;
  sidebar: IAdminSidebar;
  user: IAdminUser;
  /** Si se omite, el cierre de sesión llama a `AuthService.logout()`. */
  onSignOut?: () => void;
}
