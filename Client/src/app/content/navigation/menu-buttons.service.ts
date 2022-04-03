import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { map } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteStore } from '../notes/state/notes-state';
import { MenuItem } from './menu-Item.model';
import { DialogsManageService } from './dialogs-manage.service';
import { MenuButtonsNotesService } from './menu-buttons-notes.service';
import { MenuButtonsFoldersService } from './menu-buttons-folders.service';
import { LockPopupState } from 'src/app/shared/modal_components/lock/lock.component';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SmallNote } from '../notes/models/small-note.model';
import { ChangeIsLockedFullNote, UpdateOneNote } from '../notes/state/notes-actions';
import { LockEncryptService } from '../notes/lock-encrypt.service';
import { Router } from '@angular/router';
import { FolderStore } from '../folders/state/folders-state';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';

@Injectable({ providedIn: 'root' })
export class MenuButtonsService {
  public items: MenuItem[] = [];

  public notesItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.openChangeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    this.getLockItem(),
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () =>
        this.dialogsManageService.openLockDialog(
          this.getSelectedNoteId(),
          LockPopupState.RemoveLock,
        ),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.menuButtonsNotesService.archiveNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public notesItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.openChangeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'private',
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    this.getLockItem(),
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () =>
        this.dialogsManageService.openLockDialog(
          this.getSelectedNoteId(),
          LockPopupState.RemoveLock,
        ),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.menuButtonsNotesService.archiveNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public notesItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.openChangeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    this.getLockItem(),
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () =>
        this.dialogsManageService.openLockDialog(
          this.getSelectedNoteId(),
          LockPopupState.RemoveLock,
        ),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.menuButtonsNotesService.archiveNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.openDeletionNoteModal(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'restore',
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public notesItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.openChangeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'private',
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    this.getLockItem(),
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () =>
        this.dialogsManageService.openLockDialog(
          this.getSelectedNoteId(),
          LockPopupState.RemoveLock,
        ),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public folderInnerNotesItems: MenuItem[] = [
    {
      icon: 'color',
      operation: () => this.openColorWithNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.openChangeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
  ];

  public foldersItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.menuButtonsFoldersService.archiveFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public foldersItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'privateFolder',
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.menuButtonsFoldersService.archiveFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public foldersItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.menuButtonsFoldersService.archiveFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.openDeletionNoteModal(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'restore',
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  public foldersItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'share',
      operation: () => this.openShareWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'privateFolder',
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    {
      icon: 'color',
      operation: () => this.openColorWithFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
    },
  ];

  constructor(
    private store: Store,
    private dialogsManageService: DialogsManageService,
    private pService: PersonalizationService,
    private menuButtonsNotesService: MenuButtonsNotesService,
    private menuButtonsFoldersService: MenuButtonsFoldersService,
    private lockEncryptService: LockEncryptService,
    private router: Router,
  ) {}

  // eslint-disable-next-line class-methods-use-this

  getFolderMenuByFolderType(type: FolderTypeENUM) {
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
      default: {
        throw new Error('Incorrect type');
      }
    }
  }

  getNoteMenuByNoteType(type: NoteTypeENUM) {
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
      default: {
        throw new Error('Incorrect type');
      }
    }
  }

  // SHARE
  openShareWithNotes() {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const ids = [this.store.selectSnapshot(NoteStore.oneFull).id];
      return this.dialogsManageService.openShareEntity(EntityPopupType.Note, ids);
    }
    return this.dialogsManageService.openShareEntity(
      EntityPopupType.Note,
      this.store.selectSnapshot(NoteStore.selectedIds),
    );
  }

  openShareWithFolders() {
    const type = EntityPopupType.Folder;
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const idsI = [this.store.selectSnapshot(FolderStore.full).id];
      return this.dialogsManageService.openShareEntity(type, idsI);
    }
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    return this.dialogsManageService.openShareEntity(type, ids);
  }

  // COLORS
  openColorWithNotes() {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const ids = [this.store.selectSnapshot(NoteStore.oneFull).id];
      return this.dialogsManageService.openChangeColorDialog(EntityPopupType.Note, ids);
    }
    return this.dialogsManageService.openChangeColorDialog(
      EntityPopupType.Note,
      this.store.selectSnapshot(NoteStore.selectedIds),
    );
  }

  openColorWithFolders() {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const ids = [this.store.selectSnapshot(FolderStore.full).id];
      return this.dialogsManageService.openChangeColorDialog(EntityPopupType.Folder, ids);
    }
    return this.dialogsManageService.openChangeColorDialog(
      EntityPopupType.Folder,
      this.store.selectSnapshot(FolderStore.selectedIds),
    );
  }

  // LOCK
  isActiveForceLock(): Observable<string> {
    return combineLatest([
      this.store.select(AppStore.isNoteInner),
      this.store.select(NoteStore.isCanForceLocked),
    ]).pipe(map(([n, f]) => (n && f ? 'menu.forceLock' : 'menu.lock')));
  }

  getLockItem(): MenuItem {
    return {
      icon: 'lock',
      tooltip: this.isActiveForceLock(),
      isActive: this.store.select(NoteStore.selectedCount).pipe(map((x) => x > 1)),
      isVisible: this.store.select(NoteStore.isRemoveLock).pipe(map((x) => !x)),
      operation: async () => {
        const id = this.getSelectedNoteId();
        if (
          this.store.selectSnapshot(AppStore.isNoteInner) &&
          this.store.selectSnapshot(NoteStore.isCanForceLocked)
        ) {
          await this.setLockedInState(id);
          this.router.navigate(['notes']);
          return;
        }
        return this.dialogsManageService.openLockDialog(id, LockPopupState.Lock);
      },
      isNoOwnerCanSee: false,
    };
  }

  getNote(id: string): SmallNote {
    return this.store.selectSnapshot(NoteStore.getSmallNotes).find((x) => x.id === id);
  }

  async setLockedInState(id: string) {
    await this.lockEncryptService.forceLock(id).toPromise();
    const updatedNote = { ...this.getNote(id) };
    updatedNote.isLockedNow = true;
    this.store.dispatch(new UpdateOneNote(updatedNote));
    this.store.dispatch(new ChangeIsLockedFullNote(true));
  }

  getSelectedNoteId(): string {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      return this.store.selectSnapshot(NoteStore.oneFull).id;
    }
    return this.store.selectSnapshot(NoteStore.selectedIds)[0];
  }

  setItems(newItems: MenuItem[]) {
    this.items = newItems;
  }
}
