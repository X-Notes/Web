import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FoldersComponent } from './folders/folders.component';
import { FullFolderComponent } from './full-folder/full-folder.component';
import { PrivateComponent } from './private/private.component';
import { DeletedComponent } from './deleted/deleted.component';
import { SharedComponent } from './shared/shared.component';
import { ArchiveComponent } from './archive/archive.component';
import { FullFolderNoteComponent } from './full-folder-note/full-folder-note.component';

const itemRoutes: Routes = [
  { path: '', component: PrivateComponent },
  { path: 'deleted', component: DeletedComponent },
  { path: 'shared', component: SharedComponent },
  { path: 'archive', component: ArchiveComponent },
];

const routes: Routes = [
  { path: '', component: FoldersComponent, children: itemRoutes },
  { path: ':id', component: FullFolderComponent },
  { path: ':folderId/:noteId', component: FullFolderNoteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoldersRouting {}
