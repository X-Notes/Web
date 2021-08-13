import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullNoteComponent } from './full-note.component';
import { PhotosComponent } from './full-note-components/photos/photos.component';
import { SelectionDirective } from './directives/selection.directive';
import { TextEditMenuComponent } from './text-edit-menu/text-edit-menu.component';
import { HtmlTextPartComponent } from './full-note-components/html-components/html-text-part/html-text-part.component';
import { HtmlNumberListComponent } from './full-note-components/html-components/html-number-list/html-number-list.component';
import { HtmlDotListComponent } from './full-note-components/html-components/html-dot-list/html-dot-list.component';
import { HtmlHeadingsComponent } from './full-note-components/html-components/html-headings/html-headings.component';
import { HtmlCheckListComponent } from './full-note-components/html-components/html-check-list/html-check-list.component';
import { MenuSelectionDirective } from './directives/menu-selection.directive';
import { PhotoComponent } from './full-note-components/photo/photo.component';
import { CopyDirective } from './directives/copy.directive';
import { TextEditMenuDirective } from './directives/text-edit-menu.directive';
import { ChangeSizeAlbumHeightDirective } from './directives/change-size-album-height.directive';
import { ChangeSizeAlbumWidthDirective } from './directives/change-size-album-width.directive';
import { RelatedNoteComponent } from './related-note/related-note.component';
import { HtmlLinkComponent } from './full-note-components/html-components/html-link/html-link.component';
import { HistoryRecordComponent } from './full-note-components/history-record/history-record.component';
import { AudioNoteComponent } from './full-note-components/audio-note/audio-note.component';
import { VideoNoteComponent } from './full-note-components/video-note/video-note.component';
import { DocumentNoteComponent } from './full-note-components/document-note/document-note.component';
import { AudioComponent } from './full-note-components/audio/audio.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoteSnapshotComponent } from './note-snapshot/note-snapshot.component';
import { FullNoteRouting } from './full-note-routing';
import { RightSectionContentComponent } from './right-section-content/right-section-content.component';
import { LeftSectionContentNotesListComponent } from './left-section-content-notes-list/left-section-content-notes-list.component';
import { ContentEditorComponent } from './content-editor/content-editor.component';
import { MenuSelectionService } from './services/menu-selection.service';
import { SelectionService } from './services/selection.service';
import { SidebarNotesService } from './services/sidebar-notes.service';
import { FullNoteSliderService } from './services/full-note-slider.service';
@NgModule({
  declarations: [
    FullNoteComponent,
    PhotosComponent,
    PhotoComponent,
    TextEditMenuComponent,
    HtmlTextPartComponent,
    HtmlNumberListComponent,
    HtmlDotListComponent,
    HtmlHeadingsComponent,
    HtmlCheckListComponent,
    HtmlLinkComponent,
    RelatedNoteComponent,
    MenuSelectionDirective,
    SelectionDirective,
    CopyDirective,
    TextEditMenuDirective,
    ChangeSizeAlbumHeightDirective,
    ChangeSizeAlbumWidthDirective,
    HistoryRecordComponent,
    AudioNoteComponent,
    VideoNoteComponent,
    DocumentNoteComponent,
    AudioComponent,
    NoteSnapshotComponent,
    RightSectionContentComponent,
    LeftSectionContentNotesListComponent,
    ContentEditorComponent,
  ],
  exports: [
    LeftSectionContentNotesListComponent,
    ContentEditorComponent,
    RightSectionContentComponent,
  ],
  providers: [MenuSelectionService, SelectionService, SidebarNotesService, FullNoteSliderService],
  imports: [CommonModule, SharedModule, FullNoteRouting],
})
export class FullNoteModule {}