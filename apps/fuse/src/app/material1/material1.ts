import { TextFieldModule } from "@angular/cdk/text-field";
import { Component, computed, inject } from "@angular/core";
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
import { filter } from "rxjs";

import {
  ConfirmSaveDialogComponent,
  IConfirmSaveDialogData,
} from "./confirm-save-dialog";

interface IMaterial1Form {
  name: FormControl<string>;
  description: FormControl<string>;
  manager: FormControl<string>;
}

const MANAGERS: readonly string[] = [
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
  selector: "app-material1",
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
  ],
  templateUrl: "./material1.html",
})
export class Material1Component {
  readonly form = new FormGroup<IMaterial1Form>({
    name: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl("", { nonNullable: true }),
    manager: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly filteredManagers = computed(() => {
    const query = this.managerQuery().trim().toLowerCase();

    return MANAGERS.filter((manager) => manager.toLowerCase().includes(query));
  });

  private managerQuery = toSignal(this.form.controls.manager.valueChanges, {
    initialValue: this.form.controls.manager.value,
  });

  private dialog = inject(MatDialog);

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.dialog
      .open<
        ConfirmSaveDialogComponent,
        IConfirmSaveDialogData,
        boolean
      >(ConfirmSaveDialogComponent, {
        ariaLabel: "Confirmar guardado",
        data: { name: this.form.controls.name.value },
        width: "420px",
      })
      .afterClosed()
      .pipe(filter((confirmed) => confirmed === true))
      .subscribe(() => this.form.reset());
  }
}