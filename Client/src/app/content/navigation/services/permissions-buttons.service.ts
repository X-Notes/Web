import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { FolderStore } from '../../folders/state/folders-state';
import { NoteStore } from '../../notes/state/notes-state';
import { EntityMenuEnum } from '../models/entity-menu.enum';
import { MenuButtonsService } from './menu-buttons.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsButtonsService {
  constructor(private store: Store, public menuButtonService: MenuButtonsService) {}

  get IsCanEdit(): boolean {
    if (this.menuButtonService.type === EntityMenuEnum.Note) {
      return this.store.selectSnapshot(NoteStore.getAllSelectedNotesCanEdit);
    }
    if (this.menuButtonService.type === EntityMenuEnum.Folder) {
      return this.store.selectSnapshot(FolderStore.getAllSelectedFoldersCanEdit);
    }
    return false;
  }

  // FULL FOLDER
  get IsCanEditFullFolderNotes(): boolean {
    return this.store.selectSnapshot(NoteStore.getAllSelectedFolderNotesCanEdit);
  }

  get IsOwnerFullFolderNotes(): boolean {
    const userId = this.store.selectSnapshot(UserStore.getUser).id;
    const ids = this.store.selectSnapshot(NoteStore.getAllSelectedFullFolderNotesAuthors);
    return ids && ids.every((x) => x === userId);
  }

  get isAllFullFolderNotesNoShared(): boolean {
    return this.store.selectSnapshot(NoteStore.getAllSelectedFullFolderNotesNoShared);
  }

  // FULL NOTE
  get IsCanEditFullNote(): boolean {
    return this.store.selectSnapshot(NoteStore.canEdit);
  }

  get IsOwnerFullNote(): boolean {
    const userId = this.store.selectSnapshot(UserStore.getUser).id;
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    if (note && userId) {
      return note.userId === userId;
    }
    return false;
  }

  get IsOwner(): boolean {
    const userId = this.store.selectSnapshot(UserStore.getUser).id;
    if (this.menuButtonService.type === EntityMenuEnum.Note) {
      const ids = this.store.selectSnapshot(NoteStore.getAllSelectedNotesAuthors);
      return ids && ids.every((x) => x === userId);
    }
    if (this.menuButtonService.type === EntityMenuEnum.Folder) {
      const ids = this.store.selectSnapshot(FolderStore.getAllSelectedFoldersAuthors);
      return ids && ids.every((x) => x === userId);
    }
    return false;
  }

  get isAllNotesNoShared(): boolean {
    if (this.menuButtonService.type === EntityMenuEnum.Note) {
      return this.store.selectSnapshot(NoteStore.getAllSelectedNotesNoShared);
    }
    return true;
  }
}
