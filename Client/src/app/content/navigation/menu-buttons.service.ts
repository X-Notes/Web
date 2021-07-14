import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FolderStore } from '../folders/state/folders-state';
import { NoteStore } from '../notes/state/notes-state';
import {
  CopyFolders,
  SetDeleteFolders,
  ArchiveFolders,
  DeleteFoldersPermanently,
  MakePrivateFolders,
  ChangeTypeFullFolder,
  BaseChangeTypeSmallFolder,
} from '../folders/state/folders-actions';
import {
  CopyNotes,
  SetDeleteNotes,
  ArchiveNotes,
  DeleteNotesPermanently,
  MakePrivateNotes,
  ChangeTypeFullNote,
  BaseChangeTypeSmallNote,
} from '../notes/state/notes-actions';
import { MenuItem } from './menu-Item.model';
import { DialogsManageService } from './dialogs-manage.service';
import { SnackBarWrapperService } from './snack-bar-wrapper.service';

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
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes(),
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
      operation: () => {
        const action = this.changeNoteType(new ArchiveNotes(), NoteTypeENUM.Archive);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getArchiveEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'delete',
      operation: () => {
        const action = this.changeNoteType(new SetDeleteNotes(), NoteTypeENUM.Deleted);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getDeleteEntityName,
        );
      },
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
      operation: () => {
        const action = this.changeNoteType(new MakePrivateNotes(), NoteTypeENUM.Private);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getPrivateEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes(),
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
      operation: () => {
        const action = this.changeNoteType(new ArchiveNotes(), NoteTypeENUM.Archive);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getArchiveEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'delete',
      operation: () => {
        const action = this.changeNoteType(new SetDeleteNotes(), NoteTypeENUM.Deleted);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getDeleteEntityName,
        );
      },
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
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes(),
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
      operation: () => {
        const action = this.changeNoteType(new ArchiveNotes(), NoteTypeENUM.Archive);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getArchiveEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'delete',
      operation: () => this.deleteNotes(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'restore',
      operation: () => {
        const action = this.changeNoteType(new MakePrivateNotes(), NoteTypeENUM.Private);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getPrivateEntityName,
        );
      },
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
      operation: () => {
        const action = this.changeNoteType(new MakePrivateNotes(), NoteTypeENUM.Private);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getPrivateEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: false,
    },
    {
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: false,
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes(),
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
      operation: () => {
        const action = this.changeNoteType(new SetDeleteNotes(), NoteTypeENUM.Deleted);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getNotesNaming,
          this.sbws.getDeleteEntityName,
        );
      },
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
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders(),
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
      operation: () => {
        const action = this.changeFolderType(new ArchiveFolders(), FolderTypeENUM.Archive);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getArchiveEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'delete',
      operation: () => {
        const action = this.changeFolderType(new SetDeleteFolders(), FolderTypeENUM.Deleted);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getDeleteEntityName,
        );
      },
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
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'privateFolder',
      operation: () => {
        const action = this.changeFolderType(new MakePrivateFolders(), FolderTypeENUM.Private);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getPrivateEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders(),
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
      operation: () => {
        const action = this.changeFolderType(new ArchiveFolders(), FolderTypeENUM.Archive);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getArchiveEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'delete',
      operation: () => {
        const action = this.changeFolderType(new SetDeleteFolders(), FolderTypeENUM.Deleted);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getDeleteEntityName,
        );
      },
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
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders(),
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
      operation: () => {
        const action = this.changeFolderType(new ArchiveFolders(), FolderTypeENUM.Archive);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getArchiveEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'delete',
      operation: () => this.deleteFolders(),
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'restore',
      operation: () => {
        const action = this.changeFolderType(new MakePrivateFolders(), FolderTypeENUM.Private);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getPrivateEntityName,
        );
      },
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
      icon: 'shared',
      operation: () => this.dialogsManageService.shareEntity(),
      isVisible: of(true),
      isNoOwnerCanSee: true,
      isViewOnFullFolder: true,
    },
    {
      icon: 'privateFolder',
      operation: () => {
        const action = this.changeFolderType(new MakePrivateFolders(), FolderTypeENUM.Private);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getPrivateEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders(),
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
      operation: () => {
        const action = this.changeFolderType(new SetDeleteFolders(), FolderTypeENUM.Deleted);
        const func = () => {
          this.store.dispatch(action);
        };
        this.sbws.build(
          func,
          action.isMany,
          this.sbws.getFoldersNaming,
          this.sbws.getDeleteEntityName,
        );
      },
      isVisible: of(true),
      isNoOwnerCanSee: false,
      isViewOnFullFolder: true,
    },
  ];

  constructor(
    private store: Store,
    private snackService: SnackbarService,
    private dialogsManageService: DialogsManageService,
    private sbws: SnackBarWrapperService,
    private pService: PersonalizationService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  getRevertActionNotes(type: NoteTypeENUM, ids): BaseChangeTypeSmallNote {
    const types = NoteTypeENUM;
    switch (type) {
      case types.Private: {
        const obj = new MakePrivateNotes();
        obj.typeNote = type;
        obj.selectedIds = ids;
        return obj;
      }
      case types.Shared: {
        throw new Error('no implimented');
      }
      case types.Archive: {
        const obj = new ArchiveNotes();
        obj.typeNote = type;
        obj.selectedIds = ids;
        return obj;
      }
      case types.Deleted: {
        const obj = new SetDeleteNotes();
        obj.typeNote = type;
        obj.selectedIds = ids;
        return obj;
      }
      default: {
        throw new Error('error');
      }
    }
  }

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

  // eslint-disable-next-line class-methods-use-this
  getRevertActionFolder(type: FolderTypeENUM, ids): BaseChangeTypeSmallFolder {
    const types = FolderTypeENUM;
    switch (type) {
      case types.Private: {
        const obj = new MakePrivateFolders();
        obj.typeFolder = type;
        obj.selectedIds = ids;
        return obj;
      }
      case types.Shared: {
        throw new Error('no implimented');
      }
      case types.Archive: {
        const obj = new ArchiveFolders();
        obj.typeFolder = type;
        obj.selectedIds = ids;
        return obj;
      }
      case types.Deleted: {
        const obj = new SetDeleteFolders();
        obj.typeFolder = type;
        obj.selectedIds = ids;
        return obj;
      }
      default: {
        throw new Error('error');
      }
    }
  }

  changeFolderType(changeAction: BaseChangeTypeSmallFolder, typeTo: FolderTypeENUM) {
    let prevType: FolderTypeENUM;
    let ids;

    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folder = this.store.selectSnapshot(FolderStore.full);
      ids = [folder.id];

      prevType = folder.folderTypeId;

      this.store.dispatch(new ChangeTypeFullFolder(typeTo));
    } else {
      ids = this.store.selectSnapshot(FolderStore.selectedIds);
      prevType = this.store.selectSnapshot(AppStore.getTypeFolder);
    }

    // eslint-disable-next-line no-param-reassign
    changeAction.typeFolder = prevType;
    // eslint-disable-next-line no-param-reassign
    changeAction.selectedIds = ids;

    this.store.dispatch(changeAction);

    return this.getRevertActionFolder(prevType, ids);
  }

  changeNoteType(changeAction: BaseChangeTypeSmallNote, typeTo: NoteTypeENUM) {
    let prevType: NoteTypeENUM;
    let ids;

    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      ids = [note.id];

      prevType = note.noteTypeId;

      this.store.dispatch(new ChangeTypeFullNote(typeTo));
    } else {
      prevType = this.store.selectSnapshot(AppStore.getTypeNote);
      ids = this.store.selectSnapshot(NoteStore.selectedIds);
    }

    // eslint-disable-next-line no-param-reassign
    changeAction.typeNote = prevType;
    // eslint-disable-next-line no-param-reassign
    changeAction.selectedIds = ids;

    this.store.dispatch(changeAction);

    return this.getRevertActionNotes(prevType, ids);
  }

  deletePermSnackbar(language: LanguagesENUM, type: string, isMany: boolean) {
    // TODO Move to snackbar service
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(
            isMany ? `Notes deleted permanently` : `Note deleted permanently`,
            null,
          );
        } else {
          snackbarRef = this.snackService.openSnackBar(
            isMany ? `Folders deleted permanently` : `Folder deleted permanently`,
            null,
          );
        }
        break;
      }
      case LanguagesENUM.Russian: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(
            isMany ? `Заметки удалены безвозвратно` : `Заметка удалена безвозвратно`,
            null,
          );
        } else {
          snackbarRef = this.snackService.openSnackBar(
            isMany ? `Папки удалены безвозвратно` : `Папка удалена безвозвратно`,
            null,
          );
        }
        break;
      }
      case LanguagesENUM.Ukraine: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(
            isMany ? `Нотатки видалені безповоротно` : `Нотаток видален безповоротно`,
            null,
          );
        } else {
          snackbarRef = this.snackService.openSnackBar(
            isMany ? `Папки видалені безповоротно` : `Папка видалена безповоротно`,
            null,
          );
        }
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    return snackbarRef;
  }

  // DELETE PERMANENTLY

  deleteNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const idsInner = [note.id];
      this.store.dispatch(new DeleteNotesPermanently(idsInner, NoteTypeENUM.Deleted));
      this.deletePermSnackbar(language, 'Note', false);
    } else {
      const idsOuter = this.store.selectSnapshot(NoteStore.selectedIds);
      const isMany = idsOuter.length > 1;
      this.store.dispatch(new DeleteNotesPermanently(idsOuter, NoteTypeENUM.Deleted));
      this.deletePermSnackbar(language, 'Note', isMany);
    }
  }

  deleteFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    this.store.dispatch(new DeleteFoldersPermanently(ids, FolderTypeENUM.Deleted));
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    const isMany = ids.length > 1;
    this.deletePermSnackbar(language, 'Folder', isMany);
    this.store.dispatch(new DeleteFoldersPermanently(ids, FolderTypeENUM.Deleted));
  }

  setItems(newItems: MenuItem[]) {
    this.items = newItems;
  }

  // COPY
  private copyNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids = [note.id];
      this.store.dispatch(new CopyNotes(note.noteTypeId, ids, pr));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new CopyNotes(noteType, ids, pr));
    }
  }

  private copyFolders() {
    const isInnerFolder = this.store.selectSnapshot(AppStore.isFolderInner);
    if (isInnerFolder) {
      const folder = this.store.selectSnapshot(FolderStore.full);
      const ids = [folder.id];
      this.store.dispatch(new CopyFolders(folder.folderTypeId, ids));
    } else {
      const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
      const ids = this.store.selectSnapshot(FolderStore.selectedIds);
      this.store.dispatch(new CopyFolders(folderType, ids));
    }
  }
}
