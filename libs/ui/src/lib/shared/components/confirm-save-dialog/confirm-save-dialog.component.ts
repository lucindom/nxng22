import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";

export interface IConfirmSaveDialogData {
  name?: string;
  entity?: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const DEFAULTS: Required<IConfirmSaveDialogData> = {
  name: "",
  entity: "el registro",
  title: "Confirmar guardado",
  confirmLabel: "Guardar",
  cancelLabel: "Cancelar",
};

/**
 * Diálogo de confirmación de guardado. Se puede usar:
 * - con `MatDialog.open(ConfirmSaveDialogComponent, { data })` (cierra con `true`/`false`), o
 * - embebido como `<lib-confirm-save-dialog>` usando los inputs y outputs.
 * Los valores de `data` tienen prioridad sobre los inputs cuando ambos están definidos.
 */
@Component({
  selector: "lib-confirm-save-dialog",
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule],
  templateUrl: "./confirm-save-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmSaveDialogComponent {
  readonly name = input(DEFAULTS.name);

  readonly entity = input(DEFAULTS.entity);

  readonly title = input(DEFAULTS.title);

  readonly confirmLabel = input(DEFAULTS.confirmLabel);

  readonly cancelLabel = input(DEFAULTS.cancelLabel);

  readonly confirmed = output<void>();

  readonly cancelled = output<void>();

  protected readonly view = computed<Required<IConfirmSaveDialogData>>(() => ({
    name: this.data?.name ?? this.name(),
    entity: this.data?.entity ?? this.entity(),
    title: this.data?.title ?? this.title(),
    confirmLabel: this.data?.confirmLabel ?? this.confirmLabel(),
    cancelLabel: this.data?.cancelLabel ?? this.cancelLabel(),
  }));

  private dialogRef = inject<MatDialogRef<ConfirmSaveDialogComponent, boolean>>(MatDialogRef, {
    optional: true,
  });

  private data = inject<IConfirmSaveDialogData>(MAT_DIALOG_DATA, { optional: true });

  protected confirm(): void {
    this.confirmed.emit();
    this.dialogRef?.close(true);
  }

  protected cancel(): void {
    this.cancelled.emit();
    this.dialogRef?.close(false);
  }
}
