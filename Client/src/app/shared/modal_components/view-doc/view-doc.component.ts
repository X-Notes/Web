import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-doc',
  templateUrl: './view-doc.component.html',
  styleUrls: ['./view-doc.component.scss'],
})
export class ViewDocComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewDocComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) {}

  close() {
    this.dialogRef.close();
  }

  // eslint-disable-next-line class-methods-use-this
  get googleDriveUrl() {
    return 'https://docs.google.com/gview?url=%URL%&embedded=true';
  }
}
