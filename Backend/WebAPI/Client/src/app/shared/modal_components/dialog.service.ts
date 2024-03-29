import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
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
