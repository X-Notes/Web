import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MyHammerConfig } from 'src/app/shared/hammer.config';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesComponent } from './notes/notes.component';
import { NoteRouting } from './notes-routing';
import { FullNoteComponent } from './full-note/full-note.component';
import { PrivatesComponent } from './privates/privates.component';
import { SharedComponent } from './shared/shared.component';
import { DeletedComponent } from './deleted/deleted.component';
import { ArchiveComponent } from './archive/archive.component';
import { PhotosComponent } from './full-note-components/photos/photos.component';
import { SelectionDirective } from './directives/selection.directive';
import { SelectionService } from './selection.service';
import { TextEditMenuComponent } from './text-edit-menu/text-edit-menu.component';
import { MenuSelectionService } from './menu-selection.service';
import { HtmlTextPartComponent } from './full-note-components/html-components/html-text-part/html-text-part.component';
import { HtmlNumberListComponent } from './full-note-components/html-components/html-number-list/html-number-list.component';
import { HtmlDotListComponent } from './full-note-components/html-components/html-dot-list/html-dot-list.component';
import { HtmlHeadingsComponent } from './full-note-components/html-components/html-headings/html-headings.component';
import { HtmlCheckListComponent } from './full-note-components/html-components/html-check-list/html-check-list.component';
import { MenuSelectionDirective } from './directives/menu-selection.directive';
import { CopyDirective } from './directives/copy.directive';
import { TextEditMenuDirective } from './directives/text-edit-menu.directive';
import { PhotoComponent } from './full-note-components/photo/photo.component';
import { ChangeSizeAlbumHeightDirective } from './directives/change-size-album-height.directive';
import { ChangeSizeAlbumWidthDirective } from './directives/change-size-album-width.directive';
import { SmallNoteComponent } from './small-note/small-note.component';
import { HtmlLinkComponent } from './full-note-components/html-components/html-link/html-link.component';
import { HistoryRecordComponent } from './full-note-components/history-record/history-record.component';

@NgModule({
  declarations: [
    NotesComponent,
    FullNoteComponent,
    PrivatesComponent,
    SharedComponent,
    DeletedComponent,
    ArchiveComponent,
    PhotosComponent,
    SelectionDirective,
    TextEditMenuComponent,
    HtmlTextPartComponent,
    HtmlNumberListComponent,
    HtmlDotListComponent,
    HtmlHeadingsComponent,
    HtmlCheckListComponent,
    MenuSelectionDirective,
    CopyDirective,
    TextEditMenuDirective,
    PhotoComponent,
    ChangeSizeAlbumHeightDirective,
    ChangeSizeAlbumWidthDirective,
    SmallNoteComponent,
    HtmlLinkComponent,
    HistoryRecordComponent,
  ],
  imports: [CommonModule, NoteRouting, SharedModule],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
    MurriService,
    SelectionService,
    MenuSelectionService,
  ],
})
export class NotesModule {}
