import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // Usamos Signals de Angular para reactividad óptima
  private isAuthenticatedSignal = signal<boolean>(this.checkToken());

  constructor() {}

  private checkToken(): boolean {
    return !!localStorage.getItem("user_session_token");
  }

  get isAuthenticated() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  login(token: string): void {
    localStorage.setItem("user_session_token", token);
    this.isAuthenticatedSignal.set(true);
  }

  logout(): void {
    localStorage.removeItem("user_session_token");
    this.isAuthenticatedSignal.set(false);
  }
}
