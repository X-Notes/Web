import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-generic-deletion-pop-up',
  templateUrl: './generic-deletion-pop-up.component.html',
  styleUrls: ['./generic-deletion-pop-up.component.scss'],
})
export class GenericDeletionPopUpComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<GenericDeletionPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string; additionalMessage: string },
  ) {}

  ngOnInit(): void {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
