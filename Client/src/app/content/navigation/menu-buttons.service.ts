import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { EditingLabelsNoteComponent } from 'src/app/shared/modal_components/editing-labels-note/editing-labels-note.component';
import { MenuItem } from './menu_item';
import {
  CopyNotes, SetDeleteNotes, ArchiveNotes,
  DeleteNotesPermanently, MakePrivateNotes, ChangeTypeFullNote
} from '../notes/state/notes-actions';
import {
  CopyFolders, SetDeleteFolders, ArchiveFolders,
  DeleteFoldersPermanently, MakePrivateFolders
} from '../folders/state/folders-actions';
import { ShareComponent } from 'src/app/shared/modal_components/share/share.component';
import { NoteStore } from '../notes/state/notes-state';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { FolderStore } from '../folders/state/folders-state';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { OpenInnerSideComponent } from 'src/app/shared/modal_components/open-inner-side/open-inner-side.component';
import { FolderType } from 'src/app/shared/models/folderType';
import { NoteType } from 'src/app/shared/models/noteType';
import { LanguagesENUM } from 'src/app/shared/enums/LanguagesENUM';


@Injectable({ providedIn: 'root' })
export class MenuButtonsService {

  constructor(private store: Store,
    private dialogService: DialogService,
    private snackService: SnackbarService) { }


  public saveItems: MenuItem[] = [];
  public items: MenuItem[] = [];

  public notesItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => this.changeLabels()
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.archiveNotes()
    },
    {
      icon: 'delete',
      operation: () => this.setdeleteNotes()
    }
  ];
  public notesItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => this.changeLabels()
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.archiveNotes()
    },
    {
      icon: 'delete',
      operation: () => this.setdeleteNotes()
    }
  ];
  public notesItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => this.changeLabels()
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.archiveNotes()
    },
    {
      icon: 'delete',
      operation: () => this.deleteNotes()
    },
    {
      icon: 'restore',
      operation: () => this.makePrivateNotes()
    }
  ];
  public notesItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => this.changeLabels()
    },
    {
      icon: 'private',
      operation: () => this.makePrivateNotes()
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyNotes()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'delete',
      operation: () => this.setdeleteNotes()
    }
  ];

  public foldersItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.archiveFolders()
    },
    {
      icon: 'delete',
      operation: () => this.setDeleteFolders()
    }
  ];
  public foldersItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.archiveFolders()
    },
    {
      icon: 'delete',
      operation: () => this.setDeleteFolders()
    }
  ];
  public foldersItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'archive',
      operation: () => this.archiveFolders()
    },
    {
      icon: 'delete',
      operation: () => this.deleteFolders()
    },
    {
      icon: 'restore',
      operation: () => this.restoreFolders()
    }
  ];
  public foldersItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => this.shareEntity()
    },
    {
      icon: 'copy',
      operation: () => this.copyFolders()
    },
    {
      icon: 'color',
      operation: () => this.changeColor()
    },
    // {
    //   icon: 'download',
    //   operation: () => 5
    // },
    // {
    //   icon: 'lock',
    //   operation: () => 5
    // },
    {
      icon: 'delete',
      operation: () => this.setDeleteFolders()
    }
  ];


  filterItems(newItems: MenuItem[]) {
    this.items = newItems;
  }

  setItems(newItems: MenuItem[]) {
    this.saveItems = newItems;
    this.items = newItems;
  }

  // FUNCTIONS

  // COLOR
  changeColor() {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass: this.getTheme() === ThemeENUM.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(ChangeColorComponent, config);
  }

  // LABELS
  changeLabels() {
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: this.getTheme() === ThemeENUM.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(EditingLabelsNoteComponent, config);
  }

  // SHARING
  shareEntity() {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: this.getTheme() === ThemeENUM.Light ? ['custom-dialog-class-light', 'sharing-modal'] : ['custom-dialog-class-dark', 'sharing-modal'],
    };
    this.dialogService.openDialog(ShareComponent, config);
  }

  getTheme() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    return theme.name;
  }

  openSideModal() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: theme.name === ThemeENUM.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(OpenInnerSideComponent, config);
  }


  // COPY
  private copyNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids = [note.id];
      this.store.dispatch(new CopyNotes(note.noteType, ids));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new CopyNotes(type, ids));
    }
  }

  private copyFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const type = this.store.selectSnapshot(AppStore.getFolderTypes).find(x => x.name === folderType);
    this.store.dispatch(new CopyFolders(type, ids));
  }

  // SET DELETE
  private setdeleteNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids = [note.id];

      const snackbarRef = this.deleteSnackbar(language.name, 'Note', false);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveToInner(note.noteType, ids);
        }
      });
      this.store.dispatch(new SetDeleteNotes(note.noteType, ids));
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      this.store.dispatch(new ChangeTypeFullNote(type));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new SetDeleteNotes(type, ids));
      const isMany = ids.length > 1 ? true : false;

      const snackbarRef = this.deleteSnackbar(language.name, 'Note', isMany);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveTo(noteType, ids);
        }
      });
      this.store.dispatch(new SetDeleteNotes(noteType, ids));
    }
  }

  snackbarMoveTo(type: NoteTypeENUM, ids) {
    const types = NoteTypeENUM;
    switch (type) {
      case types.Private: {
        this.store.dispatch(new MakePrivateNotes(type, ids));
        break;
      }
      case types.Shared: {
        break;
      }
      case types.Archive: {
        this.store.dispatch(new ArchiveNotes(type, ids));
        break;
      }
      case types.Deleted: {
        this.store.dispatch(new SetDeleteNotes(type, ids));
        break;
      }
    }
  }

  snackbarFolderMoveTo(type: FolderType, ids) {
    const types = FolderTypeENUM;
    switch (type.name) {
      case types.Private: {
        this.store.dispatch(new MakePrivateFolders(type, ids));
        break;
      }
      case types.Shared: {
        break;
      }
      case types.Archive: {
        this.store.dispatch(new ArchiveFolders(type, ids));
        break;
      }
      case types.Deleted: {
        this.store.dispatch(new SetDeleteFolders(type, ids));
        break;
      }
    }
  }

  snackbarMoveToInner(type: NoteType, ids) {
    const types = NoteTypeENUM;
    switch (type.name) {
      case types.Private: {
        this.store.dispatch(new MakePrivateNotes(type, ids));
        this.store.dispatch(new ChangeTypeFullNote(type));
        break;
      }
      case types.Shared: {
        break;
      }
      case types.Archive: {
        this.store.dispatch(new ArchiveNotes(type, ids));
        this.store.dispatch(new ChangeTypeFullNote(type));
        break;
      }
      case types.Deleted: {
        this.store.dispatch(new SetDeleteNotes(type, ids));
        this.store.dispatch(new ChangeTypeFullNote(type));
        break;
      }
    }
  }

  private setDeleteFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const type = this.store.selectSnapshot(AppStore.getFolderTypes).find(x => x.name === folderType);
    this.store.dispatch(new SetDeleteFolders(type, ids));
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    const isMany = ids.length > 1 ? true : false;
    const snackbarRef = this.deleteSnackbar(language.name, 'Folder', isMany);
    snackbarRef.afterDismissed().subscribe(x => {
      if (x.dismissedByAction) {
        this.snackbarFolderMoveTo(type, ids);
      }
    });
    this.store.dispatch(new SetDeleteFolders(type, ids));
  }

  private makePrivateNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids = [note.id];

      const snackbarRef = this.privateSnackbar(language.name, 'Note', false);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveToInner(note.noteType, ids);
        }
      });
      this.store.dispatch(new MakePrivateNotes(note.noteType, ids));
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      this.store.dispatch(new ChangeTypeFullNote(type));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new MakePrivateNotes(type, ids));
      const isMany = ids.length > 1 ? true : false;
      const snackbarRef = this.privateSnackbar(language.name, 'Note', isMany);

      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveTo(noteType, ids);
        }
      });
      this.store.dispatch(new MakePrivateNotes(noteType, ids));
    }
  }

  private restoreFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const type = this.store.selectSnapshot(AppStore.getFolderTypes).find(x => x.name === folderType);
    this.store.dispatch(new MakePrivateFolders(type, ids));
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    const isMany = ids.length > 1 ? true : false;
    const snackbarRef = this.privateSnackbar(language.name, 'Folder', isMany);

    snackbarRef.afterDismissed().subscribe(x => {
      if (x.dismissedByAction) {
        this.snackbarFolderMoveTo(type, ids);
      }
    });
    this.store.dispatch(new MakePrivateFolders(type, ids));
  }

  // ARCHIVE

  archiveNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids = [note.id];

      const snackbarRef = this.archiveSnackbar(language.name, 'Note', false);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveToInner(note.noteType, ids);
        }
      });
      this.store.dispatch(new ArchiveNotes(note.noteType, ids));
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      this.store.dispatch(new ChangeTypeFullNote(type));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === noteType);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new ArchiveNotes(type, ids));
      const isMany = ids.length > 1 ? true : false;
      const snackbarRef = this.archiveSnackbar(language.name, 'Note', isMany);

      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveTo(noteType, ids);
        }
      });
      this.store.dispatch(new ArchiveNotes(noteType, ids));
    }
  }

  deleteSnackbar(language: string, type: string, isMany: boolean) {
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Notes moved to bin` : `Note moved to bin`, 'Undo');
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Folders moved to bin` : `Folder moved to bin`, 'Undo');
        }
        break;
      }
      case LanguagesENUM.Russian: {
        if (type === 'Note') {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Заметки перенесены в корзину` : `Заметка перенесена в корзину`, 'Отменить');
        } else {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Папки перенесены в корзину` : `Папка перенесена в корзину`, 'Отменить');
        }
        break;
      }
      case LanguagesENUM.Ukraine: {
        if (type === 'Note') {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Нотатки перенесені в кошик` : `Нотаток перенесений в кошик`, 'Відмінити');
        } else {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Папки перенесені в кошик` : `Папка перенесена в кошик`, 'Відмінити');
        }
        break;
      }
    }
    return snackbarRef;
  }

  archiveSnackbar(language: string, type: string, isMany: boolean) {
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English: {
        if (type === 'Note') {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Notes moved to archive` : `Note moved to archive`, 'Undo');
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Folders moved to archive` : `Folder moved to archive`, 'Undo');
        }
        break;
      }
      case LanguagesENUM.Russian: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Заметки перенесены в архив` : `Заметка перенесена в архив`, 'Отменить');
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Папки перенесены в архив` : `Папка перенесена в архив`, 'Отменить');
        }
        break;
      }
      case LanguagesENUM.Ukraine: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Нотатки перенесені в архів` : `Нотаток перенесений в архів`, 'Відмінити');
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Папки перенесені в архів` : `Папка перенесена в архів`, 'Відмінити');
        }
        break;
      }
    }
    return snackbarRef;
  }

  privateSnackbar(language: string, type: string, isMany: boolean) {
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Notes moved to personal` : `Note moved to personal`, 'Undo');
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Folders moved to personal` : `Folder moved to personal`, 'Undo');
        }
        break;
      }
      case LanguagesENUM.Russian: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Заметки перенесены ​​в личные` : `Заметка перенесена ​​в личные`, 'Отменить');
        } else {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Папки перенесены ​​в личные` : `Папка перенесена ​​в личные`, 'Отменить');
        }
        break;
      }
      case LanguagesENUM.Ukraine: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Нотатки перенесені до особистих` : `Нотаток перенесений до особистих`, 'Відмінити');
        } else {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Папки перенесені до особистих` : `Папка перенесена до особистих`, 'Отменить');
        }
        break;
      }
    }
    return snackbarRef;
  }

  deletePermSnackbar(language: string, type: string, isMany: boolean) {
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English: {
        if (type === 'Note') {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Notes deleted permanently` : `Note deleted permanently`, null);
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Folders deleted permanently` : `Folder deleted permanently`, null);
        }
        break;
      }
      case LanguagesENUM.Russian: {
        if (type === 'Note') {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Заметки удалены безвозвратно` : `Заметка удалена безвозвратно`, null);
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Папки удалены безвозвратно` : `Папка удалена безвозвратно`, null);
        }
        break;
      }
      case LanguagesENUM.Ukraine: {
        if (type === 'Note') {
          snackbarRef =
            this.snackService.openSnackBar(isMany ? `Нотатки видалені безповоротно` : `Нотаток видален безповоротно`, null);
        } else {
          snackbarRef = this.snackService.openSnackBar(isMany ? `Папки видалені безповоротно` : `Папка видалена безповоротно`, null);
        }
        break;
      }
    }
    return snackbarRef;
  }

  archiveFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const type = this.store.selectSnapshot(AppStore.getFolderTypes).find(x => x.name === folderType);
    this.store.dispatch(new ArchiveFolders(type, ids));
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    const snackbarRef = this.archiveSnackbar(language.name, 'Folder', false);
    snackbarRef.afterDismissed().subscribe(x => {
      if (x.dismissedByAction) {
        this.snackbarFolderMoveTo(type, ids);
      }
    });
  }

  // DELETE PERMANENTLY

  deleteNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const type = this.store.selectSnapshot(AppStore.getNoteTypes).find(x => x.name === NoteTypeENUM.Deleted);
    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids = [note.id];
      this.store.dispatch(new DeleteNotesPermanently(ids, type));
    } else {
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new DeleteNotesPermanently(ids, type));
      const language = this.store.selectSnapshot(UserStore.getUserLanguage);

      if (isInnerNote) {
        const note = this.store.selectSnapshot(NoteStore.oneFull);
        const ids = [note.id];
        this.deletePermSnackbar(language.name, 'Note', false);
        this.store.dispatch(new DeleteNotesPermanently(ids, type));
      } else {
        const ids = this.store.selectSnapshot(NoteStore.selectedIds);
        const isMany = ids.length > 1 ? true : false;
        this.deletePermSnackbar(language.name, 'Note', isMany);
        this.store.dispatch(new DeleteNotesPermanently(ids, type));
      }
    }
  }

  deleteFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const type = this.store.selectSnapshot(AppStore.getFolderTypes).find(x => x.name === FolderTypeENUM.Deleted);
    this.store.dispatch(new DeleteFoldersPermanently(ids, type));
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    const isMany = ids.length > 1 ? true : false;
    this.deletePermSnackbar(language.name, 'Folder', isMany);
    this.store.dispatch(new DeleteFoldersPermanently(ids, type));
  }

}
