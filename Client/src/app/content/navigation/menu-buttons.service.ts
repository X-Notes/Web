import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { EditingLabelsNoteComponent } from 'src/app/shared/modal_components/editing-labels-note/editing-labels-note.component';
import { MenuItem } from './menu_item';
import { CopyNotes, SetDeleteNotes, ArchiveNotes,
  DeleteNotesPermanently, MakePrivateNotes, ChangeTypeFullNote } from '../notes/state/notes-actions';
import { CopyFolders, SetDeleteFolders, ArchiveFolders,
   DeleteFoldersPermanently, MakePrivateFolders } from '../folders/state/folders-actions';
import { ShareComponent } from 'src/app/shared/modal_components/share/share.component';
import { NoteStore } from '../notes/state/notes-state';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { FolderStore } from '../folders/state/folders-state';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';


@Injectable({providedIn: 'root'})
export class MenuButtonsService {

  constructor(private store: Store,
              private dialogService: DialogService,
              private snackService: SnackbarService) {}


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
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass: theme === Theme.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(ChangeColorComponent, config);
  }

  // LABELS
  changeLabels() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: theme === Theme.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(EditingLabelsNoteComponent, config);
  }

  // SHARING
  shareEntity() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      maxHeight: '100%',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: theme === Theme.Light ? ['custom-dialog-class-light', 'sharing-modal'] : ['custom-dialog-class-dark', 'sharing-modal'],
    };
    this.dialogService.openDialog(ShareComponent, config);
  }


  // COPY
  private copyNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids  = [note.id];
      this.store.dispatch(new CopyNotes(note.noteType, ids));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new CopyNotes(noteType, ids));
    }
  }

  private copyFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    this.store.dispatch(new CopyFolders(folderType, ids));
  }

  // SET DELETE
  private setdeleteNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids  = [note.id];

      const snackbarRef = this.deleteNotesSnackbar(language);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveToInner(note.noteType, ids);
        }
      });
      this.store.dispatch(new SetDeleteNotes(note.noteType, ids));
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Deleted));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);

      const snackbarRef = this.deleteNotesSnackbar(language);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveTo(noteType, ids);
        }
      });
      this.store.dispatch(new SetDeleteNotes(noteType, ids));
    }
  }

  snackbarMoveTo(type: NoteType, ids) {
    const types = NoteType;
    switch (type) {
      case types.Private : {
        this.store.dispatch(new MakePrivateNotes(type , ids));
        break;
      }
      case types.Shared : {
        break;
      }
      case types.Archive : {
        this.store.dispatch(new ArchiveNotes(type, ids));
        break;
      }
      case types.Deleted : {
        this.store.dispatch(new SetDeleteNotes(type, ids));
        break;
      }
    }
  }

  snackbarMoveToInner(type: NoteType, ids) {
    const types = NoteType;
    switch (type) {
      case types.Private : {
        this.store.dispatch(new MakePrivateNotes(type, ids));
        this.store.dispatch(new ChangeTypeFullNote(NoteType.Private));
        break;
      }
      case types.Shared : {
        break;
      }
      case types.Archive : {
        this.store.dispatch(new ArchiveNotes(type, ids));
        this.store.dispatch(new ChangeTypeFullNote(NoteType.Archive));
        break;
      }
      case types.Deleted : {
        this.store.dispatch(new SetDeleteNotes(type, ids));
        this.store.dispatch(new ChangeTypeFullNote(NoteType.Deleted));
        break;
      }
    }
  }

  deleteNotesSnackbar(language: string) {
    let snackbarRef;
    switch (language) {
      case 'English': {
        snackbarRef = this.snackService.openSnackBar('Note moved to bin', 'Undo');
        break;
      }
      case 'Russian': {
        snackbarRef = this.snackService.openSnackBar('Заметка перенесена в корзину', 'Отменить');
        break;
      }
      case 'Ukraine': {
        snackbarRef = this.snackService.openSnackBar('Замітка перенесена в кошик', 'Відмінити');
        break;
      }
    }
    return snackbarRef;
  }

  private setDeleteFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    this.store.dispatch(new SetDeleteFolders(folderType, ids));
  }

  private makePrivateNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids  = [note.id];
      this.store.dispatch(new MakePrivateNotes(note.noteType, ids));
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Private));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new MakePrivateNotes(noteType , ids));
    }
  }

  private restoreFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    this.store.dispatch(new MakePrivateFolders(folderType, ids));
  }

  // ARCHIVE

  archiveNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids  = [note.id];

      const snackbarRef = this.archiveNotesSnackbar(language);
      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveToInner(note.noteType, ids);
        }
      });
      this.store.dispatch(new ArchiveNotes(note.noteType, ids));
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Archive));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      const snackbarRef = this.archiveNotesSnackbar(language);

      snackbarRef.afterDismissed().subscribe(x => {
        if (x.dismissedByAction) {
          this.snackbarMoveTo(noteType, ids);
        }
      });
      this.store.dispatch(new ArchiveNotes(noteType, ids));
    }
  }

  archiveNotesSnackbar(language: string) {
    let snackbarRef;
    switch (language) {
      case 'English': {
        snackbarRef = this.snackService.openSnackBar('Note moved to archive', 'Undo');
        break;
      }
      case 'Russian': {
        snackbarRef = this.snackService.openSnackBar('Заметка перенесена в архив', 'Отменить');
        break;
      }
      case 'Ukraine': {
        snackbarRef = this.snackService.openSnackBar('Замітка перенесена в архів', 'Відмінити');
        break;
      }
    }
    return snackbarRef;
  }

  archiveFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    this.store.dispatch(new ArchiveFolders(folderType, ids));
  }

  // DELETE PERMANENTLY

  deleteNotes() {
    const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInnerNote) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      const ids  = [note.id];
      this.store.dispatch(new DeleteNotesPermanently(ids));
    } else {
      const ids = this.store.selectSnapshot(NoteStore.selectedIds);
      this.store.dispatch(new DeleteNotesPermanently(ids));
    }
  }

  deleteFolders() {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    this.store.dispatch(new DeleteFoldersPermanently(ids));
  }

}
