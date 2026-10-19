import { inject } from "@angular/core";
import { IAdminLayoutConfig } from "@nx-ng-v22/layout";

import { THEME_PRESETS } from "../modules/settings/data/preferences";
import { FuseLayoutData } from "./data/layout-data";
import { NAVIGATION } from "./data/navigation";
import { SEARCH_DATA } from "./data/search-data";

/** Configuración del AdminLayout de fuse. Se usa con `provideAdminLayout()`. */
export const fuseLayoutConfig = (): IAdminLayoutConfig => {
  const layoutData = inject(FuseLayoutData);

  return {
    appearance: "card",
    mobileBreakpoint: "(width < 64rem)",
    brand: {
      kind: "mark",
      alt: "Fuse logo",
      markSrc: "/images/logo/logomark.svg",
      title: "FUSE",
      subtitle: "by BuilderKit",
    },
    navigation: NAVIGATION,
    navigationBadges: layoutData.badges,
    header: {
      schemeSwitcher: true,
      user: true,
      search: SEARCH_DATA,
      notifications: {
        source: layoutData,
        settingsRoute: "/settings/notifications",
        viewAllRoute: "/notifications",
      },
      quickSettings: { themePresets: THEME_PRESETS },
    },
    sidebar: {
      favorites: true,
      darkScheme: false,
      width: "80px",
      promo: {
        icon: "blocks",
        title: "Built with BuilderKit",
        description: "Angular components, blocks, templates and agent skills.",
        cta: {
          label: "Explore BuilderKit",
          href: "https://builderkit.dev?utm_source=fuse&utm_medium=sidebar",
        },
      },
    },
    user: {
      name: "John Builder",
      email: "john@example.com",
      photo: "/images/photos/john-builder.jpg",
      avatarClass: "grayscale",
      profileInMenu: true,
      menu: [
        {
          id: "upgrade",
          label: "Upgrade to Pro",
          icon: "sparkles",
          dividerBefore: true,
        },
        {
          id: "account",
          label: "Account",
          icon: "circle-user",
          route: "/settings/profile",
          dividerBefore: true,
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: "bell",
          route: "/notifications",
        },
        {
          id: "scheme",
          label: "Color scheme",
          icon: "sun-moon",
          action: "scheme",
          dividerBefore: true,
        },
        {
          id: "preferences",
          label: "Preferences",
          icon: "sliders-horizontal",
          route: "/settings/preferences",
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
  };
};
