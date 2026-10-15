import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "@nx-ng-v22/core";

import { ISidebarMenuItem } from "../../models/sidebar-menu-item";

@Component({
  selector: "lib-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar h-screen w-[250px] bg-primary p-5 text-on-primary">
      <h3>Menú Principal</h3>
      <ul>
        @for (item of menu(); track item.route) {
          <li>
            <a
              class="block rounded px-2 py-1"
              [routerLink]="item.route"
              routerLinkActive="bg-white/20 font-bold"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
      <div class="session-status mt-12">
        <p>
          Estado:
          {{ authService.isAuthenticated() ? "Sesión Activa" : "Invitado" }}
        </p>
        @if (!authService.isAuthenticated()) {
          <button (click)="login()">Simular Login</button>
        }
        @if (authService.isAuthenticated()) {
          <button (click)="logout()">Cerrar Sesión</button>
        }
      </div>
    </div>
  `,
})
export class SidebarComponent {
  readonly menu = input<ISidebarMenuItem[]>([]);

  protected authService = inject(AuthService);

  login() {
    this.authService.login("xyz123_token_ejemplo");
  }

  logout() {
    this.authService.logout();
  }
}
