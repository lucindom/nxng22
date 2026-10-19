import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  imports: [RouterOutlet],
  selector: "app-root",
  host: {
    class: "flex min-h-full w-full flex-auto flex-col",
  },
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class App {
  protected title = "spark";
}
