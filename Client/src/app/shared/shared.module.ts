import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { HammerModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatSliderModule } from '@angular/material/slider';
import { DialogService } from './modal_components/dialog.service';
import { ChangeColorComponent } from './modal_components/change-color/change-color.component';
import { EditingLabelsNoteComponent } from './modal_components/editing-labels-note/editing-labels-note.component';
import { ReplacePipe } from './pipes/replace.pipe';
import { LabelComponent } from '../content/labels/label/label.component';
import { SearchLabelPipe } from './pipes/search-label.pipe';
import { OrderService } from './services/order.service';
import { NoDeletedLabelsPipe } from './pipes/no-deleted-labels.pipe';
import { LastTwoNoDeletedLabelsPipe } from './pipes/last-two-no-deleted-labels.pipe';
import { BackgroundService } from '../content/profile/background.service';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';
import { SpinnerComponent } from './spinner/spinner.component';
import { ShareComponent } from './modal_components/share/share.component';
import { ThemeDirective } from './directives/theme.directive';
import { SharingLinkPipe } from './pipes/sharing-note-link.pipe';
import { ScrollControlDirective } from './directives/scroll-control.directive';
import { SearchComponent } from './modal_components/search/search.component';
import { OpenInnerSideComponent } from './modal_components/open-inner-side/open-inner-side.component';
import { NoteComponent } from '../content/notes/note/note.component';
import { GetImagePipe } from './pipes/get-image.pipe';
import { SelectComponent } from './custom-components/select/select.component';
import { ChipComponent } from './custom-components/chip/chip.component';
import { SelectOptionComponent } from './custom-components/select-option/select-option.component';
import { ButtonToggleComponent } from './custom-components/button-toggle/button-toggle.component';
import { ToggleTextComponent } from './custom-components/toggle-text/toggle-text.component';
import { NotePreviewTextComponent } from '../content/notes/note/note-preview-text/note-preview-text.component';
import { NotePreviewPhotosComponent } from '../content/notes/note/note-preview-photos/note-preview-photos.component';
import { ManageNotesInFolderComponent } from './modal_components/manage-notes-in-folder/manage-notes-in-folder.component';
import { MemoryIndicatorComponent } from './memory-indicator/memory-indicator.component';
import { DialogGenericHeaderComponent } from './modal_components/dialog-generic-header/dialog-generic-header.component';
import { FolderTypePipe } from './pipes/folder-type.pipe';
import { LazyThemeDirective } from './directives/lazy-theme.directive';
import { GetAudioPipe } from './pipes/get-audio.pipe';
import { GetVideoPipe } from './pipes/get-video.pipe';
import { GetDocumentPipe } from './pipes/get-document.pipe';
import { LockComponent } from './modal_components/lock/lock.component';
import { NoResultsIllustrationComponent } from './custom-components/no-results-illustration/no-results-illustration.component';
import { UserOnEntityCardComponent } from './modal_components/share/user-on-entity-card/user-on-entity-card.component';
import { ViewDocComponent } from './modal_components/view-doc/view-doc.component';
import { DialogGenericSaveComponent } from './modal_components/dialog-generic-save/dialog-generic-save.component';

@NgModule({
  declarations: [
    ChangeColorComponent,
    EditingLabelsNoteComponent,
    ReplacePipe,
    LabelComponent,
    SearchLabelPipe,
    NoDeletedLabelsPipe,
    LastTwoNoDeletedLabelsPipe,
    ShareComponent,
    TooltipComponent,
    TooltipDirective,
    SpinnerComponent,
    ThemeDirective,
    SharingLinkPipe,
    ScrollControlDirective,
    SearchComponent,
    OpenInnerSideComponent,
    NoteComponent,
    SearchComponent,
    GetImagePipe,
    SelectComponent,
    ChipComponent,
    SelectOptionComponent,
    ButtonToggleComponent,
    ToggleTextComponent,
    NotePreviewTextComponent,
    NotePreviewPhotosComponent,
    ManageNotesInFolderComponent,
    MemoryIndicatorComponent,
    DialogGenericHeaderComponent,
    FolderTypePipe,
    LazyThemeDirective,
    GetAudioPipe,
    GetVideoPipe,
    GetDocumentPipe,
    LockComponent,
    NoResultsIllustrationComponent,
    UserOnEntityCardComponent,
    ViewDocComponent,
    DialogGenericSaveComponent,
  ],
  imports: [
    CommonModule,
    MatRippleModule,
    TranslateModule,
    MatDialogModule,
    HammerModule,
    FormsModule,
    MatTabsModule,
    OverlayModule,
    NgScrollbarModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    ReactiveFormsModule,
    NgxDocViewerModule,
    MatSliderModule,
  ],
  exports: [
    TranslateModule,
    MatRippleModule,
    MatDialogModule,
    HammerModule,
    ReplacePipe,
    FormsModule,
    LabelComponent,
    SearchLabelPipe,
    NoDeletedLabelsPipe,
    LastTwoNoDeletedLabelsPipe,
    MatTabsModule,
    OverlayModule,
    TooltipDirective,
    SpinnerComponent,
    ThemeDirective,
    SharingLinkPipe,
    ScrollControlDirective,
    MatExpansionModule,
    NgScrollbarModule,
    SearchComponent,
    MatCheckboxModule,
    GetImagePipe,
    MatSnackBarModule,
    NoteComponent,
    SelectComponent,
    SelectOptionComponent,
    ButtonToggleComponent,
    ToggleTextComponent,
    NotePreviewTextComponent,
    NotePreviewPhotosComponent,
    MemoryIndicatorComponent,
    MatIconModule,
    MatMenuModule,
    FolderTypePipe,
    LazyThemeDirective,
    GetAudioPipe,
    GetVideoPipe,
    GetDocumentPipe,
    ReactiveFormsModule,
    NoResultsIllustrationComponent,
    UserOnEntityCardComponent,
    ViewDocComponent,
    DialogGenericSaveComponent,
    NgxDocViewerModule,
    MatSliderModule,
  ],
  providers: [DialogService, OrderService, BackgroundService],
  entryComponents: [TooltipComponent],
})
export class SharedModule {}
