import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteStore } from '../notes/state/notes-state';
import { MenuItem } from './menu-Item.model';
import { DialogsManageService } from './dialogs-manage.service';
import { MenuButtonsNotesService } from './menu-buttons-notes.service';
import { MenuButtonsFoldersService } from './menu-buttons-folders.service';

@Injectable({ providedIn: 'root' })
export class MenuButtonsService {
  public items: MenuItem[] = [];

  public notesItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.changeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'lock',
      isActive: this.store.select(NoteStore.selectedCount).pipe(map((x) => x > 1)),
      isVisible: this.store.select(NoteStore.isRemoveLock).pipe(map((x) => !x)),
      operation: () => this.dialogsManageService.lock(),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () => this.dialogsManageService.lock(null, true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
  ];

  public notesItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.changeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'private',
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'lock',
      isActive: this.store.select(NoteStore.selectedCount).pipe(map((x) => x > 1)),
      isVisible: this.store.select(NoteStore.isRemoveLock).pipe(map((x) => !x)),
      operation: () => this.dialogsManageService.lock(),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () => this.dialogsManageService.lock(null, true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.setDeleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
  ];

  public notesItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.changeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'lock',
      isActive: this.store.select(NoteStore.selectedCount).pipe(map((x) => x > 1)),
      isVisible: this.store.select(NoteStore.isRemoveLock).pipe(map((x) => !x)),
      operation: () => this.dialogsManageService.lock(),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () => this.dialogsManageService.lock(null, true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: false,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsNotesService.deleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'restore',
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
  ];

  public notesItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: this.pService.isMobileHistoryActive$,
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'label',
      operation: () => this.dialogsManageService.changeLabels(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'private',
      operation: () => this.menuButtonsNotesService.setPrivateNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsNotesService.copyNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'lock',
      isActive: this.store.select(NoteStore.selectedCount).pipe(map((x) => x > 1)),
      isVisible: this.store.select(NoteStore.isRemoveLock).pipe(map((x) => !x)),
      operation: () => this.dialogsManageService.lock(),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'unlock',
      isVisible: this.store.select(NoteStore.isRemoveLock),
      operation: () => this.dialogsManageService.lock(null, true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: false,
    },
  ];

  public foldersItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: true,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
  ];

  public foldersItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'privateFolder',
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: true,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.setDeleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
  ];

  public foldersItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: true,
    },
    {
      icon: 'delete',
      operation: () => this.menuButtonsFoldersService.deleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'restore',
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
  ];

  public foldersItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5,
      isVisible: of(false),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'share',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'privateFolder',
      operation: () => this.menuButtonsFoldersService.setPrivateFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'color',
      operation: () => this.dialogsManageService.changeColor(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
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
      isViewOnFullFolder: true,
    },
  ];

  constructor(
    private store: Store,
    private dialogsManageService: DialogsManageService,
    private pService: PersonalizationService,
    private menuButtonsNotesService: MenuButtonsNotesService,
    private menuButtonsFoldersService: MenuButtonsFoldersService,
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

  setItems(newItems: MenuItem[]) {
    this.items = newItems;
  }
}
