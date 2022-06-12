import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { DialogsManageService } from './dialogs-manage.service';
import { MenuButtonsNotesService } from './menu-buttons-notes.service';
import { MenuButtonsFoldersService } from './menu-buttons-folders.service';
import { LockPopupState } from 'src/app/shared/modal_components/lock/lock.component';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { Router } from '@angular/router';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { MenuItem } from '../models/menu-Item.model';
import { NoteStore } from '../../notes/state/notes-state';
import { LockEncryptService } from '../../notes/lock-encrypt.service';
import { FolderStore } from '../../folders/state/folders-state';
import { SmallNote } from '../../notes/models/small-note.model';
import {
  PatchUpdatesUINotes,
  UnSelectAllNote,
  UpdateFullNote,
  UpdateOneNote,
} from '../../notes/state/notes-actions';
import { EntityMenuEnum } from '../models/entity-menu.enum';
import { UpdateNoteUI } from '../../notes/state/update-note-ui.model';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { SmallFolder } from '../../folders/models/folder.model';

@Injectable({ providedIn: 'root' })
export class MenuButtonsService {
  public items: MenuItem[] = [];

  public type: EntityMenuEnum;

  public notesItemsPrivate: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    this.getLockItem(),
    this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    this.getArchiveNotesItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
  ];

  public notesItemsShared: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getSetPrivateNotes(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    this.getLockItem(),
    this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    this.getArchiveNotesItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: this.store.select(AppStore.isSharedNote),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    },
  ];

  public notesItemsDeleted: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    this.getLockItem(),
    this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    this.getArchiveNotesItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.openDeletionNoteModal(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
    this.getSetPrivateNotes('restore'),
  ];

  public notesItemsArchive: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getSetPrivateNotes(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    this.getLockItem(),
    this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
  ];

  // INNER FOLDER
  public folderInnerNotesItems: MenuItem[] = [
    this.getNoteShareItem(),
    this.getChangeColorNoteItem(),
    this.getLabelItem(),
    {
      icon: 'delete',
      operation: () => this.pService.removeNotesToFolderSubject.next(true),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
      tooltip: of('menu.removeFromFolder'),
    },
    this.getCopyNotesItem(),
  ];

  // FOLDERS
  public foldersItemsPrivate: MenuItem[] = [
    this.getHistoryItem(),
    this.getFolderShareItem(),
    this.getCopyFoldersItem(),
    this.getChangeColorFolderItem(),
    this.getArchiveFoldersItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
  ];

  public foldersItemsShared: MenuItem[] = [
    this.getHistoryItem(),
    this.getFolderShareItem(),
    this.getSetPrivateFolders(),
    this.getCopyFoldersItem(),
    this.getChangeColorFolderItem(),
    this.getArchiveFoldersItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: this.store.select(AppStore.isSharedFolder),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    },
  ];

  public foldersItemsDeleted: MenuItem[] = [
    this.getHistoryItem(),
    this.getFolderShareItem(),
    this.getCopyFoldersItem(),
    this.getChangeColorFolderItem(),
    this.getArchiveFoldersItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.openDeletionNoteModal(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
    this.getSetPrivateFolders('restore'),
  ];

  public foldersItemsArchive: MenuItem[] = [
    this.getHistoryItem(),
    this.getFolderShareItem(),
    this.getSetPrivateFolders(),
    this.getCopyFoldersItem(),
    this.getChangeColorFolderItem(),
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
  ];

  constructor(
    private store: Store,
    private dialogsService: DialogsManageService,
    private pService: PersonalizationService,
    private menuButtonsNotesService: MenuButtonsNotesService,
    private menuButtonsFoldersService: MenuButtonsFoldersService,
    private lockEncryptService: LockEncryptService,
    private router: Router,
    private updaterEntitiesService: UpdaterEntitiesService,
  ) {}

  // eslint-disable-next-line class-methods-use-this

  getFolderMenuByFolderType(type: FolderTypeENUM) {
    if (!type) return [];
    switch (type) {
      case FolderTypeENUM.Private: {
        return this.foldersItemsPrivate;
      }
      case FolderTypeENUM.Archive: {
        return this.foldersItemsArchive;
      }
      case FolderTypeENUM.Shared: {
        return this.foldersItemsShared;
      }
      case FolderTypeENUM.Deleted: {
        return this.foldersItemsDeleted;
      }
    }
  }

  getNoteMenuByNoteType(type: NoteTypeENUM) {
    if (!type) return [];
    switch (type) {
      case NoteTypeENUM.Private: {
        return this.notesItemsPrivate;
      }
      case NoteTypeENUM.Archive: {
        return this.notesItemsArchive;
      }
      case NoteTypeENUM.Shared: {
        return this.notesItemsShared;
      }
      case NoteTypeENUM.Deleted: {
        return this.notesItemsDeleted;
      }
    }
  }

  // SHARE
  openShareWithNotes() {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const notes = [this.store.selectSnapshot(NoteStore.oneFull) as SmallNote];
      return this.dialogsService.openShareEntity(EntityPopupType.Note, notes);
    }
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folderNotes = this.store.selectSnapshot(NoteStore.getSelectedFolderNotes);
      return this.dialogsService.openShareEntity(EntityPopupType.Note, folderNotes);
    }
    const smallNotes = this.store.selectSnapshot(NoteStore.getSelectedNotes);
    return this.dialogsService.openShareEntity(EntityPopupType.Note, smallNotes);
  }

  openShareWithFolders() {
    const type = EntityPopupType.Folder;
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folders = [this.store.selectSnapshot(FolderStore.full) as SmallFolder];
      return this.dialogsService.openShareEntity(type, folders);
    }
    const smallFolders = this.store.selectSnapshot(FolderStore.getSelectedFolders);
    return this.dialogsService.openShareEntity(type, smallFolders);
  }

  // COLORS
  openColorWithNotes() {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const ids = [this.store.selectSnapshot(NoteStore.oneFull).id];
      return this.dialogsService.openChangeColorDialog(EntityPopupType.Note, ids);
    }
    return this.dialogsService.openChangeColorDialog(
      EntityPopupType.Note,
      this.store.selectSnapshot(NoteStore.selectedIds),
    );
  }

  openColorWithFolders() {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const ids = [this.store.selectSnapshot(FolderStore.full).id];
      return this.dialogsService.openChangeColorDialog(EntityPopupType.Folder, ids);
    }
    return this.dialogsService.openChangeColorDialog(
      EntityPopupType.Folder,
      this.store.selectSnapshot(FolderStore.selectedIds),
    );
  }

  // MENU ITEMS

  getSetPrivateFolders(icon = 'privateFolder'): MenuItem {
    return {
      icon,
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getSetPrivateNotes(icon = 'private'): MenuItem {
    return {
      icon,
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getArchiveNotesItem(): MenuItem {
    return {
      icon: 'archive',
      operation: () => this.menuButtonsNotesService.archiveNotes(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getArchiveFoldersItem(): MenuItem {
    return {
      icon: 'archive',
      operation: () => this.menuButtonsFoldersService.archiveFolders(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getCopyNotesItem(): MenuItem {
    return {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: this.isVisibleCopy,
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get isVisibleCopy(): Observable<boolean> {
    return this.store.select(NoteStore.getAllSelectedNotesUnlockedNow);
  }

  getCopyFoldersItem(): MenuItem {
    return {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    };
  }

  getNoteShareItem(): MenuItem {
    return {
      icon: 'share',
      operation: () => this.openShareWithNotes(),
      isVisible: this.isVisibleShareNote,
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get isVisibleShareNote(): Observable<boolean> {
    return this.store.select(AppStore.isNoteInner).pipe(
      switchMap((flag) => {
        if (flag) {
          return this.store.select(NoteStore.oneFull).pipe(map((x) => !x?.isLocked));
        }
        return this.store.select(NoteStore.getAllSelectedNotesUnlocked);
      }),
    );
  }

  getFolderShareItem(): MenuItem {
    return {
      icon: 'share',
      operation: () => this.openShareWithFolders(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getChangeColorFolderItem(): MenuItem {
    return {
      icon: 'color',
      operation: () => this.openColorWithFolders(),
      isVisible: of(true),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: true,
    };
  }

  getChangeColorNoteItem(): MenuItem {
    return {
      icon: 'color',
      operation: () => this.openColorWithNotes(),
      isVisible: of(true),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: true,
    };
  }

  getLabelItem(): MenuItem {
    return {
      icon: 'label',
      operation: () => this.dialogsService.openChangeLabels(),
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getHistoryItem(): MenuItem {
    return {
      icon: 'history',
      operation: () => {
        const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
        this.dialogsService.openNoteHistoriesMobile(noteId);
      },
      isVisible: this.pService.isMobileHistoryActive$,
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    };
  }

  getUnlockItem(): MenuItem {
    return {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () => {
        const id = this.getSelectedNoteId();
        this.dialogsService.openLockDialog(id, LockPopupState.RemoveLock, () =>
          this.router.navigate([`notes/${id}`]),
        );
      },
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
      isDisableForShared: true,
    };
  }

  // LOCK
  isActiveForceLock(): Observable<string> {
    return combineLatest([
      this.store.select(AppStore.isNoteInner),
      this.store.select(NoteStore.isCanForceLocked),
      this.store.select(NoteStore.isCanBeForceLockNotes),
    ]).pipe(map(([n, f, s]) => ((n && f) || s ? 'menu.forceLock' : 'menu.lock')));
  }

  isCanForceLock(): boolean {
    return (
      (this.store.selectSnapshot(AppStore.isNoteInner) &&
        this.store.selectSnapshot(NoteStore.isCanForceLocked)) ||
      this.store.selectSnapshot(NoteStore.isCanBeForceLockNotes)
    );
  }

  getLockItem(): MenuItem {
    return {
      icon: 'lock',
      tooltip: this.isActiveForceLock(),
      isActive: this.store.select(NoteStore.selectedCount).pipe(map((x) => x > 1)),
      isVisible: this.store.select(NoteStore.isRemoveLock).pipe(map((x) => !x)),
      operation: async () => {
        const id = this.getSelectedNoteId();
        if (this.isCanForceLock()) {
          await this.setLockedInState(id);
          this.updaterEntitiesService.clearLock(id);
          this.router.navigate(['notes']);
          return;
        }
        const route = this.store.selectSnapshot(AppStore.isNoteInner) ? `notes` : `notes/${id}`;
        return this.dialogsService.openLockDialog(id, LockPopupState.Lock, () =>
          this.router.navigate([route]),
        );
      },
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
      isDisableForShared: true,
    };
  }

  getNote(id: string): SmallNote {
    return this.store.selectSnapshot(NoteStore.getSmallNotes).find((x) => x.id === id);
  }

  async setLockedInState(id: string) {
    await this.lockEncryptService.forceLock(id).toPromise();
    const updatedNote = { ...this.getNote(id) };
    updatedNote.isLockedNow = true;
    updatedNote.isLocked = true;
    this.store.dispatch(new UpdateOneNote(updatedNote));
    this.store.dispatch(new UpdateFullNote({ isLocked: true, isLockedNow: true }, id));

    const obj = new UpdateNoteUI(id);
    obj.isLocked = true;
    obj.isLockedNow = true;
    this.store.dispatch(new PatchUpdatesUINotes([obj]));
    this.store.dispatch(UnSelectAllNote);
  }

  getSelectedNoteId(): string {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      return this.store.selectSnapshot(NoteStore.oneFull).id;
    }
    return this.store.selectSnapshot(NoteStore.selectedIds)[0];
  }

  setNotesItems(newItems: MenuItem[]) {
    this.type = EntityMenuEnum.Note;
    this.setItems(newItems);
  }

  setFoldersItems(newItems: MenuItem[]) {
    this.type = EntityMenuEnum.Folder;
    this.setItems(newItems);
  }

  private setItems(newItems: MenuItem[]) {
    this.items = newItems;
  }
}
