import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoldersComponent } from './folders/folders.component';
import { FoldersRouting } from './folders-routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { FolderComponent } from './folder/folder.component';
import { PrivateComponent } from './private/private.component';
import { SharedComponent } from './shared/shared.component';
import { DeletedComponent } from './deleted/deleted.component';
import { ArchiveComponent } from './archive/archive.component';
import { FullFolderComponent } from './full-folder/full-folder.component';



@NgModule({
  declarations: [
    FoldersComponent,
    FolderComponent,
    PrivateComponent,
    SharedComponent,
    DeletedComponent,
    ArchiveComponent,
    FullFolderComponent],
  imports: [
    CommonModule,
    FoldersRouting,
    SharedModule
  ]
})
export class FoldersModule { }
