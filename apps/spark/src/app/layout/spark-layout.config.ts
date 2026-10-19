import { inject } from "@angular/core";
import { IAdminLayoutConfig, RouteNavigation } from "@nx-ng-v22/layout";

/** Configuración del AdminLayout de spark. Se usa con `provideAdminLayout()`. */
export const sparkLayoutConfig = (): IAdminLayoutConfig => ({
  appearance: "flat",
  mobileBreakpoint: "(max-width: 767px)",
  brand: {
    kind: "logo",
    alt: "Spark logo",
    lightSrc: "/images/logo/logo-light.svg",
    darkSrc: "/images/logo/logo-dark.svg",
    width: 157,
    height: 54,
    markLightSrc: "/images/logo/logomark-light.svg",
    markDarkSrc: "/images/logo/logomark-dark.svg",
  },
  // Las rutas de la app, agrupadas bajo una sección "Navigation"
  navigation: [
    {
      id: "navigation",
      label: "Navigation",
      section: true,
      children: inject(RouteNavigation).build(),
    },
  ],
  header: {
    schemeSwitcher: false,
    user: false,
  },
  sidebar: {
    favorites: false,
    darkScheme: true,
    width: "100px",
    promo: {
      icon: "blocks",
      title: "Built with BuilderKit",
      description: "Angular components, blocks, templates and agent skills.",
      cta: {
        label: "Explore BuilderKit",
        href: "https://builderkit.dev?utm_source=spark&utm_medium=sidebar",
      },
    },
  },
  user: {
    name: "John Builder",
    email: "johnbuilder@example.com",
    photo: "/images/photos/john-builder.jpg",
    menu: [
      { id: "account", label: "Account", icon: "circle-user" },
      { id: "notifications", label: "Notifications", icon: "bell" },
      {
        id: "scheme",
        label: "Color scheme",
        icon: "sun-moon",
        action: "scheme",
        dividerBefore: true,
      },
      {
        id: "sign-out",
        label: "Sign out",
        icon: "log-out",
        action: "signOut",
        dividerBefore: true,
      },
    ],
  },
});
