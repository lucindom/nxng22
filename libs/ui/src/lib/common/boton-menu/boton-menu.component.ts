import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";

export type BotonMenuAccion = "guardar" | "borrar" | "cancelar";

export interface IBotonMenuOpcion {
  accion: BotonMenuAccion;
  etiqueta: string;
  icono: string;
}

const OPCIONES_MENU: readonly IBotonMenuOpcion[] = [
  { accion: "guardar", etiqueta: "Guardar", icono: "save" },
  { accion: "borrar", etiqueta: "Borrar", icono: "delete" },
  { accion: "cancelar", etiqueta: "Cancelar", icono: "close" },
];

@Component({
  selector: "lib-boton-menu",
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: "./boton-menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotonMenuComponent {
  readonly etiqueta = input("Acciones");

  readonly accionSeleccionada = output<BotonMenuAccion>();

  protected readonly opciones = OPCIONES_MENU;

  protected seleccionar(accion: BotonMenuAccion): void {
    this.accionSeleccionada.emit(accion);
  }
}
