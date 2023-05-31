import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FoldersComponent } from './folders/folders.component';
import { FoldersRouting } from './folders-routing';
import { FolderComponent } from './folder/folder.component';
import { PrivateComponent } from './private/private.component';
import { SharedComponent } from './shared/shared.component';
import { DeletedComponent } from './deleted/deleted.component';
import { ArchiveComponent } from './archive/archive.component';
import { FullFolderComponent } from './full-folder/full-folder.component';
import { FullFolderNoteComponent } from './full-folder-note/full-folder-note.component';
import { FullFolderContentComponent } from './full-folder-content/full-folder-content.component';
import { EditorModule } from 'src/app/editor/editor.module';
import { FullNoteModule } from '../notes/full-note/full-note.module';

@NgModule({
  declarations: [
    FoldersComponent,
    FolderComponent,
    PrivateComponent,
    SharedComponent,
    DeletedComponent,
    ArchiveComponent,
    FullFolderComponent,
    FullFolderNoteComponent,
    FullFolderContentComponent,
  ],
  imports: [CommonModule, FoldersRouting, SharedModule, EditorModule, FullNoteModule],
  providers: [MurriService],
  exports: [FullFolderContentComponent],
})
export class FoldersModule {}
