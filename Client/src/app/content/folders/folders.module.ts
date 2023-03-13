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
import { FullNoteModule } from '../notes/full-note/full-note.module';
import { WebSocketsFolderUpdaterService } from './full-folder/services/web-sockets-folder-updater.service';
import { FullFolderSubHeaderComponent } from './full-folder/components/full-folder-sub-header/full-folder-sub-header.component';

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
    FullFolderSubHeaderComponent,
  ],
  imports: [CommonModule, FoldersRouting, SharedModule, FullNoteModule],
  providers: [MurriService, WebSocketsFolderUpdaterService],
  exports: [],
})
export class FoldersModule {}
