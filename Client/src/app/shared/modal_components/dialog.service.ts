import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { ComponentType } from '@angular/cdk/portal';

@Injectable()
export class DialogService {
  constructor(public dialog: MatDialog) {}

  openDialog<T>(component: ComponentType<T>, config: MatDialogConfig) {
    const dialogRef = this.dialog.open(component, config);
    if (window.innerWidth > 600) {
      dialogRef.disableClose = false;
    } else {
      dialogRef.disableClose = true;
    }
    return dialogRef;
  }
}
