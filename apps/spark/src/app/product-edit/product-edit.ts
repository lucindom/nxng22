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
import { Router } from "@angular/router";
import {
  BotonMenuAccion,
  BotonMenuComponent,
  ConfirmSaveDialogComponent,
  IConfirmSaveDialogData,
} from "@nx-ng-v22/ui";
import { filter } from "rxjs";

interface IProductEditForm {
  name: FormControl<string>;
  description: FormControl<string>;
  department: FormControl<string>;
}

const DEPARTMENTS: readonly string[] = [
  "Abarrotes",
  "Lácteos",
  "Panadería",
  "Carnes y Embutidos",
  "Frutas y Verduras",
  "Bebidas",
  "Limpieza",
  "Cuidado Personal",
  "Electrónica",
  "Ferretería",
  "Juguetería",
  "Papelería",
];

@Component({
  selector: "app-product-edit",
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,

    BotonMenuComponent,
  ],
  templateUrl: "./product-edit.html",
})
export class ProductEditComponent {
  readonly form = new FormGroup<IProductEditForm>({
    name: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl("", { nonNullable: true }),
    department: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly filteredDepartments = computed(() => {
    const query = this.departmentQuery().trim().toLowerCase();

    return DEPARTMENTS.filter((department) =>
      department.toLowerCase().includes(query),
    );
  });

  private departmentQuery = toSignal(
    this.form.controls.department.valueChanges,
    { initialValue: this.form.controls.department.value },
  );

  private dialog = inject(MatDialog);
  private router = inject(Router);

  private readonly accionesMenu: Record<BotonMenuAccion, () => void> = {
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
          data: { name: this.form.controls.name.value, entity: "el producto" },
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
