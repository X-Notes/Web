import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FullNoteComponent } from './full-note.component';
import { PhotosComponent } from './full-note-components/collection-components/collection-photos/photos/photos.component';
import { SelectionDirective } from './directives/selection.directive';
import { TextEditMenuComponent } from './text-edit-menu/text-edit-menu.component';
import { HtmlTextPartComponent } from './full-note-components/html-components/html-text-part/html-text-part.component';
import { HtmlNumberListComponent } from './full-note-components/html-components/html-number-list/html-number-list.component';
import { HtmlDotListComponent } from './full-note-components/html-components/html-dot-list/html-dot-list.component';
import { HtmlHeadingsComponent } from './full-note-components/html-components/html-headings/html-headings.component';
import { HtmlCheckListComponent } from './full-note-components/html-components/html-check-list/html-check-list.component';
import { MenuSelectionDirective } from './directives/menu-selection.directive';
import { PhotoComponent } from './full-note-components/collection-components/collection-photos/photo/photo.component';
import { CopyDirective } from './directives/copy.directive';
import { ChangeSizeAlbumHeightDirective } from './directives/change-size-album-height.directive';
import { HtmlLinkComponent } from './full-note-components/html-components/html-link/html-link.component';
import { AudioNoteComponent } from './full-note-components/collection-components/collection-audio/audio-note/audio-note.component';
import { VideoNoteComponent } from './full-note-components/collection-components/collection-video/video-note/video-note.component';
import { DocumentNoteComponent } from './full-note-components/collection-components/collection-document/document-note/document-note.component';
import { AudioComponent } from './full-note-components/collection-components/collection-audio/audio/audio.component';
import { NoteSnapshotComponent } from './note-snapshot/note-snapshot.component';
import { FullNoteRouting } from './full-note-routing';
import { RightSectionContentComponent } from './right-section-content/right-section-content.component';
import { LeftSectionContentNotesListComponent } from './left-section-content-notes-list/left-section-content-notes-list.component';
import { ContentEditorComponent } from './content-editor/content-editor.component';
import { SelectionService } from './content-editor-services/selection.service';
import { ClickableContentService } from './content-editor-services/clickable-content.service';
import { ContentEditorElementsListenerService } from './content-editor-services/content-editor-elements-listener.service';
import { ContentEditorContentsService } from './content-editor-services/core/content-editor-contents.service';
import { ContentEditorAudiosCollectionService } from './content-editor-services/file-content/content-editor-audios.service';
import { ContentEditorDocumentsCollectionService } from './content-editor-services/file-content/content-editor-documents.service';
import { ContentEditorPhotosCollectionService } from './content-editor-services/file-content/content-editor-photos.service';
import { ContentEditorVideosCollectionService } from './content-editor-services/file-content/content-editor-videos.service';
import { ContentEditorTextService } from './content-editor-services/text-content/content-editor-text.service';
import { ContentEditorListenerService } from './content-editor-services/content-editor-listener.service';
import { ContentEditorMomentoStateService } from './content-editor-services/core/content-editor-momento-state.service';
import { DragDropHandlerComponent } from './ui-components/drag-drop-handler/drag-drop-handler.component';
import { TitleCollectionComponent } from './full-note-components/collection-components/title-collection/title-collection.component';
import { DragDropHandlerContainerComponent } from './ui-components/drag-drop-handler-container/drag-drop-handler-container.component';
import { DocumentItemComponent } from './full-note-components/collection-components/collection-document/document-item/document-item.component';
import { EmptyCollectionItemsPlaceholderComponent } from './full-note-components/collection-components/empty-collection-items-placeholder/empty-collection-items-placeholder.component';
import { ContentUpdateWsService } from './content-editor-services/content-update-ws.service';
import { MobileTransformMenuComponent } from './full-note-components/mobile-transform-menu/mobile-transform-menu.component';
import { ContentEditorRestoreService } from './content-editor-services/core/content-editor-restore.service';
import { ContentEditorSyncService } from './content-editor-services/core/content-editor-sync.service';
import { HtmlPropertyTagCollectorService } from './content-editor-services/html-property-tag-collector.service';
import { ColorPickItemComponent } from './text-edit-menu/components/color-pick-item/color-pick-item.component';

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
    MenuSelectionDirective,
    SelectionDirective,
    CopyDirective,
    ChangeSizeAlbumHeightDirective,
    AudioNoteComponent,
    VideoNoteComponent,
    DocumentNoteComponent,
    AudioComponent,
    NoteSnapshotComponent,
    RightSectionContentComponent,
    LeftSectionContentNotesListComponent,
    ContentEditorComponent,
    DragDropHandlerComponent,
    TitleCollectionComponent,
    DragDropHandlerContainerComponent,
    DocumentItemComponent,
    EmptyCollectionItemsPlaceholderComponent,
    MobileTransformMenuComponent,
    ColorPickItemComponent,
  ],
  exports: [
    LeftSectionContentNotesListComponent,
    ContentEditorComponent,
    RightSectionContentComponent,
  ],
  providers: [
    SelectionService,
    HtmlPropertyTagCollectorService,
    ClickableContentService,
    ContentEditorElementsListenerService,
    ContentEditorListenerService,
    ContentEditorContentsService,
    ContentEditorAudiosCollectionService,
    ContentEditorDocumentsCollectionService,
    ContentEditorPhotosCollectionService,
    ContentEditorVideosCollectionService,
    ContentEditorTextService,
    ContentEditorMomentoStateService,
    ContentUpdateWsService,
    ContentEditorRestoreService,
    ContentEditorSyncService,
  ],
  imports: [CommonModule, SharedModule, FullNoteRouting],
})
export class FullNoteModule {}
