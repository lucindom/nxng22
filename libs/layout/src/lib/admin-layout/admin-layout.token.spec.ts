import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import {
  injectAdminLayoutConfig,
  provideAdminLayout,
} from "./admin-layout.token";
import { IAdminLayoutConfig } from "./models/admin-layout-config";

const CONFIG: IAdminLayoutConfig = {
  appearance: "flat",
  mobileBreakpoint: "(max-width: 767px)",
  brand: { kind: "mark", alt: "Logo", markSrc: "/logo.svg", title: "App" },
  header: { schemeSwitcher: false, user: false },
  sidebar: { favorites: false, darkScheme: false, promo: null, width: "80px" },
  user: { name: "Ada", email: "ada@example.com", photo: "/ada.jpg", menu: [] },
};

describe("provideAdminLayout", () => {
  it("exposes the configuration built by the factory", () => {
    TestBed.configureTestingModule({
      providers: [provideAdminLayout(() => CONFIG)],
    });

    expect(TestBed.runInInjectionContext(injectAdminLayoutConfig)).toBe(CONFIG);
  });

  it("fails with a clear message when the provider is missing", () => {
    expect(() =>
      TestBed.runInInjectionContext(injectAdminLayoutConfig),
    ).toThrow(/provideAdminLayout/);
  });
});
