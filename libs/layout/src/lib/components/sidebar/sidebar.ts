import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { AuthService } from "@nx-ng-v22/core";

@Component({
  selector: "lib-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="sidebar"
      style="width: 250px; background: #222; color: #fff; height: 100vh; padding: 20px;"
    >
      <h3>Menú Principal</h3>
      <ul>
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Dashboard</a></li>
      </ul>
      <div class="session-status" style="margin-top: 50px;">
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
  protected authService = inject(AuthService);

  login() {
    this.authService.login("xyz123_token_ejemplo");
  }

  logout() {
    this.authService.logout();
  }
}
