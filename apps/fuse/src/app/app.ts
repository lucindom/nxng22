import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from "@nx-ng-v22/layout";

@Component({
  imports: [RouterModule, SidebarComponent],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class App {
  protected title = "fuse";
}
