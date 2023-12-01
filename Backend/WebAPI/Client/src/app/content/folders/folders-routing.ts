import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FoldersComponent } from './folders/folders.component';
import { FullFolderComponent } from './full-folder/full-folder.component';
import { PrivateComponent } from './private/private.component';
import { DeletedComponent } from './deleted/deleted.component';
import { SharedComponent } from './shared/shared.component';
import { ArchiveComponent } from './archive/archive.component';
import { FullFolderNoteComponent } from './full-folder-note/full-folder-note.component';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';

const itemRoutes: Routes = [
  { path: '', component: PrivateComponent, data: { route_key: EntityType.FolderPrivate } },
  { path: 'deleted', component: DeletedComponent, data: { route_key: EntityType.FolderDeleted } },
  { path: 'shared', component: SharedComponent, data: { route_key: EntityType.FolderShared } },
  { path: 'archive', component: ArchiveComponent, data: { route_key: EntityType.FolderArchive } },
];

const routes: Routes = [
  { path: '', component: FoldersComponent, children: itemRoutes },
  { path: ':id', component: FullFolderComponent, data: { route_key: EntityType.FolderInner }},
  { path: ':folderId/:noteId', component: FullFolderNoteComponent, data: { route_key: EntityType.FolderInnerNote } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoldersRouting {}
