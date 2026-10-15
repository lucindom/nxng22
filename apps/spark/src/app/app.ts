import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ISidebarMenuItem, SidebarComponent } from "@nx-ng-v22/layout";

@Component({
  imports: [RouterModule, SidebarComponent],
  selector: "app-root",
  host: {
    class: "flex min-h-full w-full flex-auto flex-col",
  },
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class App {
  protected title = "spark";

  protected readonly menu: ISidebarMenuItem[] = [
    { label: "Inicio", route: "/" },
    { label: "Edición de Productos", route: "/material1" },
  ];
}
