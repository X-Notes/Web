import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { DialogsManageService } from './dialogs-manage.service';
import { MenuButtonsNotesService } from './menu-buttons-notes.service';
import { MenuButtonsFoldersService } from './menu-buttons-folders.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { MenuItem } from '../models/menu-Item.model';
import { NoteStore } from '../../notes/state/notes-state';
import { FolderStore } from '../../folders/state/folders-state';
import { SmallNote } from '../../notes/models/small-note.model';
import { EntityMenuEnum } from '../models/entity-menu.enum';
import { SmallFolder } from '../../folders/models/folder.model';
import { CopyNoteText } from '../menu/actions/copy-note-text-action';

@Injectable({ providedIn: 'root' })
export class MenuButtonsService {
  public items: MenuItem[] = [];

  public type: EntityMenuEnum;

  public notesItemsPrivate: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getCopyNoteText(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    // this.getLockItem(),
    //this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    this.getArchiveNotesItem(),
    {
      icon: 'delete',
      operation: () => {
        this.menuButtonsNotesService.setDeleteNotes();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
  ];

  public notesItemsShared: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getCopyNoteText(),
    this.getSetPrivateNotes(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    // this.getLockItem(),
    //this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    this.getArchiveNotesItem(),
    {
      icon: 'delete',
      operation: () => {
        this.menuButtonsNotesService.setDeleteNotes();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: this.store.select(AppStore.isSharedNote),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    },
  ];

  public notesItemsDeleted: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getCopyNoteText(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    // this.getLockItem(),
    //this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    this.getArchiveNotesItem(),
    {
      icon: 'delete',
      operation: () => {
        this.menuButtonsNotesService.openDeletionNoteModal();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    },
    this.getSetPrivateNotes('restore'),
  ];

  public notesItemsArchive: MenuItem[] = [
    this.getHistoryItem(),
    this.getLabelItem(),
    this.getCopyNoteText(),
    this.getSetPrivateNotes(),
    this.getNoteShareItem(),
    this.getCopyNotesItem(),
    // this.getLockItem(),
    //this.getUnlockItem(),
    this.getChangeColorNoteItem(),
    {
      icon: 'delete',
      operation: () => {
        this.menuButtonsNotesService.setDeleteNotes();
        this.pService.innerNoteMenuActive = false;
      },
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
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
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
  ) { }

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
    const type = EntityPopupType.Note;
    if (this.store.selectSnapshot(AppStore.isNoteInnerPure)) {
      const notes = [this.store.selectSnapshot(NoteStore.oneFull) as SmallNote];
      return this.dialogsService.openShareEntity(type, notes, false);
    }
    if (this.store.selectSnapshot(AppStore.isFolderInnerNote)) {
      const folderId = this.store.selectSnapshot(FolderStore.full).id;
      const notes = [this.store.selectSnapshot(NoteStore.oneFull) as SmallNote];
      return this.dialogsService.openShareEntity(type, notes, true, folderId);
    }
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folderId = this.store.selectSnapshot(FolderStore.full).id;
      const folderNotes = this.store.selectSnapshot(NoteStore.getSelectedFolderNotes);
      return this.dialogsService.openShareEntity(type, folderNotes, true, folderId);
    }
    const smallNotes = this.store.selectSnapshot(NoteStore.getSelectedNotes);
    return this.dialogsService.openShareEntity(type, smallNotes, false);
  }

  openShareWithFolders() {
    const type = EntityPopupType.Folder;
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folders = [this.store.selectSnapshot(FolderStore.full) as SmallFolder];
      return this.dialogsService.openShareEntity(type, folders, false);
    }
    const smallFolders = this.store.selectSnapshot(FolderStore.getSelectedFolders);
    return this.dialogsService.openShareEntity(type, smallFolders, false);
  }

  // COLORS
  openColorWithNotes() {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const ids = [this.store.selectSnapshot(NoteStore.oneFull).id];
      return this.dialogsService.openChangeColorDialog(EntityPopupType.Note, ids);
    }
    return this.dialogsService.openChangeColorDialog(
      EntityPopupType.Note,
      [...this.store.selectSnapshot(NoteStore.selectedIds)],
    );
  }

  openColorWithFolders() {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const ids = [this.store.selectSnapshot(FolderStore.full).id];
      return this.dialogsService.openChangeColorDialog(EntityPopupType.Folder, ids);
    }
    return this.dialogsService.openChangeColorDialog(
      EntityPopupType.Folder,
      [...this.store.selectSnapshot(FolderStore.selectedIds)],
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
      operation: () => {
        this.menuButtonsNotesService.setPrivateNotes();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
  }

  getArchiveNotesItem(): MenuItem {
    return {
      icon: 'archive',
      operation: () => {
        this.menuButtonsNotesService.archiveNotes();
        this.pService.innerNoteMenuActive = false;
      },
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
    const isVisible = this.store.select(AppStore.isNoteInner).pipe(switchMap(flag => {
      if (flag) {
        return this.store.select(NoteStore.canView);
      }
      return this.store.select(NoteStore.selectedCount).pipe(startWith(0), map(x => x === 1));
    }));
    return {
      icon: 'copy',
      operation: () => {
        this.menuButtonsNotesService.copyNotes();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible,
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    };
  }


  getCopyFoldersItem(): MenuItem {
    const isVisible = this.store.select(AppStore.isFolderInner).pipe(switchMap(flag => {
      if (flag) {
        return this.store.select(FolderStore.canView);
      }
      return this.store.select(FolderStore.selectedCount).pipe(startWith(0), map(x => x === 1));
    }));
    return {
      icon: 'copy',
      operation: () => this.menuButtonsFoldersService.copyFolders(),
      isVisible,
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    };
  }

  getNoteShareItem(): MenuItem {
    return {
      icon: 'share',
      operation: () => {
        this.openShareWithNotes();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: of(true),
      isOnlyForAuthor: true,
      IsNeedEditRightsToSee: true,
    };
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
      operation: () => {
        this.openColorWithNotes();
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: of(true),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: true,
    };
  }

  getLabelItem(): MenuItem {
    return {
      icon: 'label',
      operation: () => {
        this.dialogsService.openChangeLabels();
        this.pService.innerNoteMenuActive = false;
      },
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
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: this.pService.isMobileHistoryActive$,
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: false,
    };
  }

  getCopyNoteText(): MenuItem {
    return {
      icon: 'copy',
      name: 'menu.copyText',
      operation: () => {
        this.store.dispatch(CopyNoteText);
        this.pService.innerNoteMenuActive = false;
      },
      isVisible: this.store.select(NoteStore.isFullNoteAndCanView).pipe(map(flag => flag && this.pService.isMobile())),
      isOnlyForAuthor: false,
      IsNeedEditRightsToSee: true,
    };
  }

  getNote(id: string): SmallNote {
    return this.store.selectSnapshot(NoteStore.getSmallNotes).find((x) => x.id === id);
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
