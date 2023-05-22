import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DialogService } from './modal_components/dialog.service';
import { ChangeColorComponent } from './modal_components/change-color/change-color.component';
import { EditingLabelsNoteComponent } from './modal_components/editing-labels-note/editing-labels-note.component';
import { LabelComponent } from '../content/labels/label/label.component';
import { SearchLabelPipe } from './pipes/search-label.pipe';
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
import { ChipComponent } from './custom-components/chip/chip.component';
import { SelectOptionComponent } from './custom-components/select-component/select-option/select-option.component';
import { ButtonToggleComponent } from './custom-components/button-toggle/button-toggle.component';
import { ToggleTextComponent } from './custom-components/toggle-text/toggle-text.component';
import { NotePreviewTextComponent } from '../content/notes/note/note-preview-text/note-preview-text.component';
import { NotePreviewPhotosComponent } from '../content/notes/note/note-preview-photos/note-preview-photos.component';
import { MemoryIndicatorComponent } from './memory-indicator/memory-indicator.component';
import { DialogGenericHeaderComponent } from './modal_components/dialog-generic-header/dialog-generic-header.component';
import { FolderTypePipe } from './pipes/folder-type.pipe';
import { LazyThemeDirective } from './directives/lazy-theme.directive';
import { LockComponent } from './modal_components/lock/lock.component';
import { NoResultsIllustrationComponent } from './custom-components/no-results-illustration/no-results-illustration.component';
import { UserOnEntityCardComponent } from './modal_components/share/user-on-entity-card/user-on-entity-card.component';
import { ViewDocComponent } from './modal_components/view-doc/view-doc.component';
import { DialogGenericSaveComponent } from './modal_components/dialog-generic-save/dialog-generic-save.component';
import { AudioControlsComponent } from './custom-components/audio-controls/audio-controls.component';
import { AudioSmallComponent } from './custom-components/audio-small/audio-small.component';
import { ManageMenuButtonsPipe } from './pipes/manage-menu-buttons.pipe';
import { LeftSectionWrapperComponent } from './left-section-wrapper/left-section-wrapper.component';
import { NavMenuItemComponent } from './left-section-components/nav-menu-item/nav-menu-item.component';
import { NavProfileItemComponent } from './left-section-components/nav-profile-item/nav-profile-item.component';
import { ButtonCollectionComponent } from '../content/notes/full-note/ui-components/button-collection/button-collection.component';
import { DropDirective } from '../content/profile/drop/drop.directive';
import { ContactUsComponent } from './modal_components/contact-us/contact-us.component';
import { AutosizeDirective } from './directives/autosize.directive';
import { ApiContactUsService } from './modal_components/contact-us/services/api-contact-us.service';
import { FormatDateMomentPipe } from './pipes/format-date-moment.pipe';
import { NotePreviewTextHeadingComponent } from '../content/notes/note/note-preview-text/note-preview-text-heading/note-preview-text-heading.component';
import { NotePreviewTextListComponent } from '../content/notes/note/note-preview-text/note-preview-text-list/note-preview-text-list.component';
import { NotePreviewDocumentsComponent } from '../content/notes/note/note-preview-documents/note-preview-documents.component';
import { NotePreviewVideosComponent } from '../content/notes/note/note-preview-videos/note-preview-videos.component';
import { NotePreviewVideoComponent } from '../content/notes/note/note-preview-videos/note-preview-video/note-preview-video.component';
import { NoteCollectionTitleComponent } from '../content/notes/note/note-collection-title/note-collection-title.component';
import { NotePreviewAudiosComponent } from '../content/notes/note/note-preview-audios/note-preview-audios.component';
import { FileNamePipe } from './pipes/file-name.pipe';
import { GenericDeletionPopUpComponent } from './modal_components/generic-deletion-pop-up/generic-deletion-pop-up.component';
import { GenericBottomButtonPopUpComponent } from './modal_components/generic-bottom-button-pop-up/generic-bottom-button-pop-up.component';
import { GenericDeleteEntityMessageComponent } from './generic-delete-entity-message/generic-delete-entity-message.component';
import { AddNotesInFolderComponent } from './modal_components/manage-notes-in-folder/add-notes-in-folder.component';
import { MailInvitationsComponent } from './modal_components/share/mail-invitations/mail-invitations.component';
import { EmptySearchPlaceholderComponent } from './modal_components/general-components/empty-search-placeholder/empty-search-placeholder.component';
import { RelatedNotesPopUpComponent } from './modal_components/related-notes-pop-up/related-notes-pop-up.component';
import { RelatedNoteComponent } from '../content/notes/full-note/related-note/related-note.component';
import { NoteHistoryPopUpComponent } from './modal_components/note-history-pop-up/note-history-pop-up.component';
import { HistoryRecordComponent } from '../content/notes/full-note/full-note-components/history-record/history-record.component';
import { DateFromNowPipe } from './pipes/date-from-now.pipe';
import { FullNoteActiveUsersComponent } from './custom-components/full-note-active-users/full-note-active-users.component';
import { LongTermOperationsHandlerComponent } from '../content/long-term-operations-handler/long-term-operations-handler.component';
import { LongTermOperationComponent } from '../content/long-term-operations-handler/long-term-operation/long-term-operation.component';
import { ContentAccessSectionComponent } from './modal_components/share/content-access-section/content-access-section.component';
import { LeftSectionEntitiesShareComponent } from './modal_components/share/left-section-entities-share/left-section-entities-share.component';
import { SelectComponent } from './custom-components/select-component/select/select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    ChangeColorComponent,
    EditingLabelsNoteComponent,
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
    SelectComponent,
    ChipComponent,
    SelectOptionComponent,
    ButtonToggleComponent,
    ToggleTextComponent,
    NotePreviewTextComponent,
    NotePreviewPhotosComponent,
    AddNotesInFolderComponent,
    MemoryIndicatorComponent,
    DialogGenericHeaderComponent,
    FolderTypePipe,
    LazyThemeDirective,
    LockComponent,
    NoResultsIllustrationComponent,
    UserOnEntityCardComponent,
    ViewDocComponent,
    DialogGenericSaveComponent,
    AudioControlsComponent,
    AudioSmallComponent,
    ManageMenuButtonsPipe,
    LeftSectionWrapperComponent,
    NavMenuItemComponent,
    NavProfileItemComponent,
    ButtonCollectionComponent,
    DropDirective,
    ContactUsComponent,
    AutosizeDirective,
    FormatDateMomentPipe,
    NotePreviewTextHeadingComponent,
    NotePreviewTextListComponent,
    NotePreviewDocumentsComponent,
    NotePreviewVideosComponent,
    NotePreviewVideoComponent,
    NoteCollectionTitleComponent,
    NotePreviewAudiosComponent,
    FileNamePipe,
    GenericDeletionPopUpComponent,
    GenericBottomButtonPopUpComponent,
    GenericDeleteEntityMessageComponent,
    MailInvitationsComponent,
    EmptySearchPlaceholderComponent,
    RelatedNotesPopUpComponent,
    RelatedNoteComponent,
    NoteHistoryPopUpComponent,
    HistoryRecordComponent,
    DateFromNowPipe,
    FullNoteActiveUsersComponent,
    LongTermOperationsHandlerComponent,
    LongTermOperationComponent,
    ContentAccessSectionComponent,
    LeftSectionEntitiesShareComponent,
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
    RouterModule,
    DragDropModule,
  ],
  exports: [
    TranslateModule,
    MatRippleModule,
    MatDialogModule,
    HammerModule,
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
    ReactiveFormsModule,
    NoResultsIllustrationComponent,
    UserOnEntityCardComponent,
    ViewDocComponent,
    DialogGenericSaveComponent,
    NgxDocViewerModule,
    MatSliderModule,
    AudioControlsComponent,
    ManageMenuButtonsPipe,
    LeftSectionWrapperComponent,
    NavMenuItemComponent,
    NavProfileItemComponent,
    DragDropModule,
    ButtonCollectionComponent,
    DropDirective,
    AutosizeDirective,
    FormatDateMomentPipe,
    NotePreviewTextHeadingComponent,
    NotePreviewTextListComponent,
    NotePreviewDocumentsComponent,
    NotePreviewVideosComponent,
    NotePreviewVideoComponent,
    NoteCollectionTitleComponent,
    NotePreviewAudiosComponent,
    FileNamePipe,
    GenericDeleteEntityMessageComponent,
    RelatedNoteComponent,
    HistoryRecordComponent,
    DateFromNowPipe,
    FullNoteActiveUsersComponent,
    LongTermOperationsHandlerComponent,
    LongTermOperationComponent,
  ],
  providers: [DialogService, BackgroundService, ApiContactUsService],
})
export class SharedModule {}
