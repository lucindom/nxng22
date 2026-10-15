import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ISidebarMenuItem, SidebarComponent } from "@nx-ng-v22/layout";

@Component({
  imports: [SidebarComponent, RouterModule],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  protected title = "notheme";

  protected readonly menu: ISidebarMenuItem[] = [
    { label: "Inicio", route: "/" },
    { label: "trabajadores", route: "/trabajadores" },
  ];
}
