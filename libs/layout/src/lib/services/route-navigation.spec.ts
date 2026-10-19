import { TestBed } from "@angular/core/testing";
import { provideRouter, Routes } from "@angular/router";
import { describe, expect, it } from "vitest";

import { RouteNavigation } from "./route-navigation";

const build = (routes: Routes) => {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });

  return TestBed.inject(RouteNavigation).build();
};

describe("RouteNavigation", () => {
  it("lists the routes that have a path", () => {
    const items = build([
      { path: "orders", data: { label: "Orders", icon: "cart" }, children: [] },
    ]);

    expect(items).toEqual([
      {
        id: "/orders",
        label: "Orders",
        icon: "cart",
        route: "/orders",
        routeActiveOptions: { exact: true },
        children: undefined,
      },
    ]);
  });

  it("publishes the children of a pathless layout route as top level items", () => {
    const items = build([
      {
        path: "",
        children: [
          { path: "", pathMatch: "full", redirectTo: "orders" },
          { path: "orders", children: [] },
        ],
      },
    ]);

    expect(items.map((item) => item.route)).toEqual(["/orders"]);
  });

  it("skips wildcard, parameterized and hidden routes", () => {
    const items = build([
      { path: "**", children: [] },
      { path: ":id", children: [] },
      { path: "secret", data: { hideInSidebar: true }, children: [] },
    ]);

    expect(items).toEqual([]);
  });
});
