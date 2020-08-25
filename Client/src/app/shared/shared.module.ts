import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogService } from './modal_components/dialog.service';
import { ChangeColorComponent } from './modal_components/change-color/change-color.component';
import { EditingLabelsNoteComponent } from './modal_components/editing-labels-note/editing-labels-note.component';
import { HammerModule } from '@angular/platform-browser';
import { ReplacePipe } from './pipes/replace.pipe';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ChangeColorComponent, EditingLabelsNoteComponent, ReplacePipe],
  imports: [CommonModule , TranslateModule, SimplebarAngularModule, MatDialogModule, HammerModule, FormsModule ],
  exports: [TranslateModule, MatRippleModule, SimplebarAngularModule, MatDialogModule, HammerModule, ReplacePipe, FormsModule ],
  providers: [DialogService]
})
export class SharedModule { }
