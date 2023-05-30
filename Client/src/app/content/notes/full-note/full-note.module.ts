import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FullNoteComponent } from './full-note.component';
import { NoteSnapshotComponent } from './note-snapshot/note-snapshot.component';
import { FullNoteRouting } from './full-note-routing';
import { RightSectionContentComponent } from './right-section-content/right-section-content.component';
import { LeftSectionContentNotesListComponent } from './left-section-content-notes-list/left-section-content-notes-list.component';
import { AudioNoteComponent } from 'src/app/editor/components/collection-components/collection-audio/audio-note/audio-note.component';
import { AudioComponent } from 'src/app/editor/components/collection-components/collection-audio/audio/audio.component';
import { DocumentItemComponent } from 'src/app/editor/components/collection-components/collection-document/document-item/document-item.component';
import { DocumentNoteComponent } from 'src/app/editor/components/collection-components/collection-document/document-note/document-note.component';
import { PhotoComponent } from 'src/app/editor/components/collection-components/collection-photos/photo/photo.component';
import { PhotosComponent } from 'src/app/editor/components/collection-components/collection-photos/photos/photos.component';
import { VideoNoteComponent } from 'src/app/editor/components/collection-components/collection-video/video-note/video-note.component';
import { EmptyCollectionItemsPlaceholderComponent } from 'src/app/editor/components/collection-components/empty-collection-items-placeholder/empty-collection-items-placeholder.component';
import { TitleCollectionComponent } from 'src/app/editor/components/collection-components/title-collection/title-collection.component';
import { DragDropHandlerContainerComponent } from 'src/app/editor/components/drag-drop-handler-container/drag-drop-handler-container.component';
import { DragDropHandlerComponent } from 'src/app/editor/components/drag-drop-handler/drag-drop-handler.component';
import { HtmlCheckListComponent } from 'src/app/editor/components/html-components/html-check-list/html-check-list.component';
import { HtmlDotListComponent } from 'src/app/editor/components/html-components/html-dot-list/html-dot-list.component';
import { HtmlHeadingsComponent } from 'src/app/editor/components/html-components/html-headings/html-headings.component';
import { HtmlLinkComponent } from 'src/app/editor/components/html-components/html-link/html-link.component';
import { HtmlNumberListComponent } from 'src/app/editor/components/html-components/html-number-list/html-number-list.component';
import { HtmlTextPartComponent } from 'src/app/editor/components/html-components/html-text-part/html-text-part.component';
import { MobileTransformMenuComponent } from 'src/app/editor/components/mobile-transform-menu/mobile-transform-menu.component';
import { ColorPickItemComponent } from 'src/app/editor/components/text-edit-menu/components/color-pick-item/color-pick-item.component';
import { TextEditMenuComponent } from 'src/app/editor/components/text-edit-menu/text-edit-menu.component';
import { ContentEditorComponent } from 'src/app/editor/content-editor.component';
import { ChangeSizeAlbumHeightDirective } from 'src/app/editor/directives/change-size-album-height.directive';
import { CopyDirective } from 'src/app/editor/directives/copy.directive';
import { LazyForDirective } from 'src/app/editor/directives/lazy-for.directive';
import { MenuSelectionDirective } from 'src/app/editor/directives/menu-selection.directive';
import { SelectionDirective } from 'src/app/editor/directives/selection.directive';
import { ContentEditorElementsListenerService } from 'src/app/editor/ui-services/content-editor-elements-listener.service';
import { HtmlPropertyTagCollectorService } from 'src/app/editor/ui-services/html-property-tag-collector.service';
import { SelectionService } from 'src/app/editor/ui-services/selection.service';

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
    LazyForDirective,
  ],
  exports: [
    LeftSectionContentNotesListComponent,
    ContentEditorComponent,
    RightSectionContentComponent,
  ],
  providers: [
    SelectionService,
    HtmlPropertyTagCollectorService,
    ContentEditorElementsListenerService,
  ],
  imports: [CommonModule, SharedModule, FullNoteRouting],
})
export class FullNoteModule {}
