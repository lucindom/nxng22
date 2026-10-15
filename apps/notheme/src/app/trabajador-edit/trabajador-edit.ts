import { TextFieldModule } from "@angular/cdk/text-field";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import {
  BotonMenuAccion,
  BotonMenuComponent,
  ConfirmSaveDialogComponent,
  IConfirmSaveDialogData,
} from "@nx-ng-v22/ui";
import { filter } from "rxjs";

interface ITrabajadorEditForm {
  name: FormControl<string>;
  notes: FormControl<string>;
  supervisor: FormControl<string>;
}

const SUPERVISORS: readonly string[] = [
  "Ana Torres",
  "Carlos Méndez",
  "Lucía Fernández",
  "Miguel Ángel Ríos",
  "Sofía Herrera",
  "Javier Castillo",
  "Valentina Ortiz",
  "Diego Navarro",
  "Camila Vargas",
  "Andrés Molina",
  "Paula Delgado",
  "Ricardo Salazar",
];

@Component({
  selector: "app-trabajador-edit",
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    BotonMenuComponent,
  ],
  templateUrl: "./trabajador-edit.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrabajadorEditComponent {
  readonly form = new FormGroup<ITrabajadorEditForm>({
    name: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl("", { nonNullable: true }),
    supervisor: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly filteredSupervisors = computed(() => {
    const query = this.supervisorQuery().trim().toLowerCase();

    return SUPERVISORS.filter((supervisor) => supervisor.toLowerCase().includes(query));
  });

  private supervisorQuery = toSignal(this.form.controls.supervisor.valueChanges, {
    initialValue: this.form.controls.supervisor.value,
  });

  private dialog = inject(MatDialog);

  private router = inject(Router);

  private readonly accionesMenu: Record<BotonMenuAccion, () => void> =
    {
      guardar: () => this.save(),
      borrar: () => this.form.reset(),
      cancelar: () => this.router.navigateByUrl("/"),
    };

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.dialog
      .open<ConfirmSaveDialogComponent, IConfirmSaveDialogData, boolean>(
        ConfirmSaveDialogComponent,
        {
          ariaLabel: "Confirmar guardado",
          data: { name: this.form.controls.name.value, entity: "el trabajador" },
          width: "420px",
        },
      )
      .afterClosed()
      .pipe(filter((confirmed) => confirmed === true))
      .subscribe(() => this.form.reset());
  }

  protected ejecutarAccion(accion: BotonMenuAccion): void {
    this.accionesMenu[accion]();
  }
}
