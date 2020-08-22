import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogService } from './modal_components/dialog.service';
import { ChangeColorComponent } from './modal_components/change-color/change-color.component';
import { EditingLabelsNoteComponent } from './modal_components/editing-labels-note/editing-labels-note.component';

@NgModule({
  declarations: [ChangeColorComponent, EditingLabelsNoteComponent],
  imports: [CommonModule , TranslateModule, SimplebarAngularModule, MatDialogModule],
  exports: [TranslateModule, MatRippleModule, SimplebarAngularModule, MatDialogModule],
  providers: [DialogService]
})
export class SharedModule { }
