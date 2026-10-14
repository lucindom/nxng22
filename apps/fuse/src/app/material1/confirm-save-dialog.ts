import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";

export interface IConfirmSaveDialogData {
  name: string;
}

@Component({
  selector: "app-confirm-save-dialog",
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule],
  templateUrl: "./confirm-save-dialog.html",
})
export class ConfirmSaveDialogComponent {
  protected readonly data = inject<IConfirmSaveDialogData>(MAT_DIALOG_DATA);
}