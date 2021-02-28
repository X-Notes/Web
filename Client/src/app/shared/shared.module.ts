import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
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
import { OverlayModule } from '@angular/cdk/overlay';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';
import { SpinnerComponent } from './spinner/spinner.component';
import { ShareComponent } from './modal_components/share/share.component';
import { ThemeDirective } from './directives/theme.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { SharingLinkPipe } from './pipes/sharing-note-link.pipe';
import { ScrollControlDirective } from './directives/scroll-control.directive';
import { PopupFullNoteComponent } from './popup/popup-full-note/popup-full-note.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SearchComponent } from './modal_components/search/search.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OpenInnerSideComponent } from './modal_components/open-inner-side/open-inner-side.component';
import { NoteComponent } from '../content/notes/note/note.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GetImagePipe } from './pipes/get-image.pipe';
import { SelectComponent } from './custom-components/select/select.component';
import { ChipComponent } from './custom-components/chip/chip.component';
import { SelectOptionComponent } from './custom-components/select-option/select-option.component';

@NgModule({
  declarations: [ChangeColorComponent, EditingLabelsNoteComponent, ReplacePipe,
    LabelComponent, SearchLabelPipe, NoDeletedLabelsPipe, LastTwoNoDeletedLabelsPipe, ShareComponent,
    TooltipComponent, TooltipDirective,
    SpinnerComponent,
    ThemeDirective,
    SharingLinkPipe,
    ScrollControlDirective,
    SearchComponent,
    OpenInnerSideComponent,
    NoteComponent,
    PopupFullNoteComponent,
    SearchComponent,
    GetImagePipe,
    SelectComponent,
    ChipComponent,
    SelectOptionComponent
  ],
  imports: [CommonModule, MatRippleModule,
    TranslateModule, MatDialogModule, HammerModule, FormsModule, MatTabsModule,
    OverlayModule, NgScrollbarModule, MatCheckboxModule, MatSnackBarModule, MatExpansionModule
  ],
  exports: [TranslateModule, MatRippleModule, MatDialogModule, HammerModule, ReplacePipe, FormsModule,
    LabelComponent, SearchLabelPipe, NoDeletedLabelsPipe, LastTwoNoDeletedLabelsPipe, MatTabsModule,
    OverlayModule,
    TooltipDirective,
    SpinnerComponent,
    ThemeDirective,
    SharingLinkPipe,
    ScrollControlDirective,
    PopupFullNoteComponent,
    MatExpansionModule,
    NgScrollbarModule,
    SearchComponent,
    MatCheckboxModule,
    GetImagePipe,
    MatSnackBarModule,
    NoteComponent,
    SelectOptionComponent
  ],
  providers: [DialogService, OrderService, BackgroundService],
  entryComponents: [TooltipComponent]
})
export class SharedModule { }
