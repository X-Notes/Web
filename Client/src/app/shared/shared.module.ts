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
import { LabelComponent } from '../content/labels/label/label.component';
import { SearchLabelPipe } from './pipes/search-label.pipe';
import { OrderService } from './services/order.service';
import { NoDeletedLabelsPipe } from './pipes/no-deleted-labels.pipe';
import { LastTwoNoDeletedLabelsPipe } from './pipes/last-two-no-deleted-labels.pipe';
import { BackgroundService } from '../content/profile/background.service';
import { ShareComponent } from './modal_components/share/share.component';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [ChangeColorComponent, EditingLabelsNoteComponent, ReplacePipe,
    LabelComponent, SearchLabelPipe, NoDeletedLabelsPipe, LastTwoNoDeletedLabelsPipe, ShareComponent],
  imports: [CommonModule , MatRippleModule,
     TranslateModule, SimplebarAngularModule, MatDialogModule, HammerModule, FormsModule, MatTabsModule ],
  exports: [TranslateModule, MatRippleModule, SimplebarAngularModule, MatDialogModule, HammerModule, ReplacePipe, FormsModule,
    LabelComponent, SearchLabelPipe, NoDeletedLabelsPipe, LastTwoNoDeletedLabelsPipe, MatTabsModule ],
  providers: [DialogService, OrderService, BackgroundService]
})
export class SharedModule { }
