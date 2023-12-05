import { NgModule } from "@angular/core";
import { SelectionService } from "./ui-services/selection.service";
import { HtmlPropertyTagCollectorService } from "./ui-services/html-property-tag-collector.service";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { ContentEditorComponent } from "./content-editor.component";
import { AudioNoteComponent } from "./components/collection-components/collection-audio/audio-note/audio-note.component";
import { AudioComponent } from "./components/collection-components/collection-audio/audio/audio.component";
import { DocumentItemComponent } from "./components/collection-components/collection-document/document-item/document-item.component";
import { DocumentNoteComponent } from "./components/collection-components/collection-document/document-note/document-note.component";
import { PhotoComponent } from "./components/collection-components/collection-photos/photo/photo.component";
import { PhotosComponent } from "./components/collection-components/collection-photos/photos/photos.component";
import { VideoNoteComponent } from "./components/collection-components/collection-video/video-note/video-note.component";
import { EmptyCollectionItemsPlaceholderComponent } from "./components/collection-components/empty-collection-items-placeholder/empty-collection-items-placeholder.component";
import { TitleCollectionComponent } from "./components/collection-components/title-collection/title-collection.component";
import { DragDropHandlerContainerComponent } from "./components/drag-drop-handler-container/drag-drop-handler-container.component";
import { DragDropHandlerComponent } from "./components/drag-drop-handler/drag-drop-handler.component";
import { HtmlCheckListComponent } from "./components/html-components/html-check-list/html-check-list.component";
import { HtmlDotListComponent } from "./components/html-components/html-dot-list/html-dot-list.component";
import { HtmlHeadingsComponent } from "./components/html-components/html-headings/html-headings.component";
import { HtmlLinkComponent } from "./components/html-components/html-link/html-link.component";
import { HtmlNumberListComponent } from "./components/html-components/html-number-list/html-number-list.component";
import { HtmlTextPartComponent } from "./components/html-components/html-text-part/html-text-part.component";
import { ColorPickItemComponent } from "./components/text-edit-menu/components/color-pick-item/color-pick-item.component";
import { TextEditMenuComponent } from "./components/text-edit-menu/text-edit-menu.component";
import { ChangeSizeAlbumHeightDirective } from "./directives/change-size-album-height.directive";
import { CopyDirective } from "./directives/copy.directive";
import { LazyForDirective } from "./directives/lazy-for.directive";
import { SelectionDirective } from "./directives/selection.directive";

@NgModule({
    declarations: [
      PhotosComponent,
      PhotoComponent,
      TextEditMenuComponent,
      HtmlTextPartComponent,
      HtmlNumberListComponent,
      HtmlDotListComponent,
      HtmlHeadingsComponent,
      HtmlCheckListComponent,
      HtmlLinkComponent,
      SelectionDirective,
      CopyDirective,
      ChangeSizeAlbumHeightDirective,
      AudioNoteComponent,
      VideoNoteComponent,
      DocumentNoteComponent,
      AudioComponent,
      ContentEditorComponent,
      DragDropHandlerComponent,
      TitleCollectionComponent,
      DragDropHandlerContainerComponent,
      DocumentItemComponent,
      EmptyCollectionItemsPlaceholderComponent,
      ColorPickItemComponent,
      LazyForDirective,
    ],
    exports: [
      ContentEditorComponent,
    ],
    providers: [
      SelectionService,
      HtmlPropertyTagCollectorService,
    ],
    imports: [CommonModule, SharedModule],
  })
  export class EditorModule {}