import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
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

  get IsCanEditFullNote(): boolean {
    return this.store.selectSnapshot(NoteStore.canEdit);
  }

  get IsOwnerFullNote(): boolean {
    return this.store.selectSnapshot(NoteStore.isOwner);
  }

  get isFullNoteNoShared(): boolean {
    return this.store.selectSnapshot(NoteStore.oneFull).noteTypeId !== NoteTypeENUM.Shared;
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
