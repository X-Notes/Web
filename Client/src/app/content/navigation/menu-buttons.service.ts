import { Injectable } from '@angular/core';
import { MenuItem } from './menu_item';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MatDialogConfig } from '@angular/material/dialog';
import { Theme } from 'src/app/shared/enums/Theme';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { CopyNotes, SetDeleteNotes, RestoreNotes, ArchiveNotes, DeleteNotesPermanently } from '../notes/state/notes-actions';
import { CopyFolders, SetDeleteFolders, RestoreFolders, ArchiveFolders, DeleteFoldersPermanently } from '../folders/state/folders-actions';
import { EditingLabelsNoteComponent } from 'src/app/shared/modal_components/editing-labels-note/editing-labels-note.component';
import { ShareComponent } from 'src/app/shared/modal_components/share/share.component';
import { FolderStore } from '../folders/state/folders-state';
import { merge } from 'rxjs';
import { NoteStore } from '../notes/state/notes-state';


@Injectable({providedIn: 'root'})
export class MenuButtonsService {

  constructor(private store: Store,
              private dialogService: DialogService, ) {}


  public saveItems: MenuItem[] = [];
  public items: MenuItem[] = [];

  public notesItemsPrivate: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: this.changeLabels.bind(this)
    },
    {
      icon: 'shared',
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyNotes.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: this.archiveNotes.bind(this)
    },
    {
      icon: 'delete',
      operation: this.setdeleteNotes.bind(this)
    }
  ];
  public notesItemsShared: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: this.changeLabels.bind(this)
    },
    {
      icon: 'shared',
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyNotes.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: this.archiveNotes.bind(this)
    },
    {
      icon: 'delete',
      operation: this.setdeleteNotes.bind(this)
    }
  ];
  public notesItemsDeleted: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: this.changeLabels.bind(this)
    },
    {
      icon: 'shared',
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyNotes.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: this.archiveNotes.bind(this)
    },
    {
      icon: 'delete',
      operation: this.deleteNotes.bind(this)
    },
    {
      icon: 'restore',
      operation: this.restoreNotes.bind(this)
    }
  ];
  public notesItemsArchive: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: this.changeLabels.bind(this)
    },
    {
      icon: 'shared',
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyNotes.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setdeleteNotes.bind(this)
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
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyFolders.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: this.archiveFolders.bind(this)
    },
    {
      icon: 'delete',
      operation: this.setDeleteFolders.bind(this)
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
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyFolders.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: this.archiveFolders.bind(this)
    },
    {
      icon: 'delete',
      operation: this.setDeleteFolders.bind(this)
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
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyFolders.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: this.archiveFolders.bind(this)
    },
    {
      icon: 'delete',
      operation: this.deleteFolders.bind(this)
    },
    {
      icon: 'restore',
      operation: this.restoreFolders.bind(this)
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
      operation: this.shareEntity.bind(this)
    },
    {
      icon: 'copy',
      operation: this.copyFolders.bind(this)
    },
    {
      icon: 'color',
      operation: this.changeColor.bind(this)
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setDeleteFolders.bind(this)
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
  private changeColor() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      width: '450px',
      maxHeight: '80vh',
      data: {
        title: 'Colors'
      },
      panelClass: theme === Theme.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(ChangeColorComponent, config);
  }

  // LABELS
  private changeLabels() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      width: '450px',
      height: '475px',
      data: {
        title: 'Labels'
      },
      panelClass: theme === Theme.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(EditingLabelsNoteComponent, config);
  }

  // SHARING
  private shareEntity() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      width: '650px',
      maxHeight: '80vh',
      data: {
        title: 'Share'
      },
      autoFocus: false,
      panelClass: theme === Theme.Light ? ['custom-dialog-class-light','sharing-modal'] : ['custom-dialog-class-dark','sharing-modal'],
    };
    this.dialogService.openDialog(ShareComponent, config);
  }


  // COPY
  private copyNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new CopyNotes(noteType));
  }

  private copyFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new CopyFolders(folderType));
  }

  // SET DELETE
  private setdeleteNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new SetDeleteNotes(noteType));
  }

  private setDeleteFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new SetDeleteFolders(folderType));
  }

  // RESTORE
  private restoreNotes() {
    this.store.dispatch(new RestoreNotes());
  }

  private restoreFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new RestoreFolders());
  }

  // ARCHIVE

  archiveNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new ArchiveNotes(noteType));
  }

  archiveFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new ArchiveFolders(folderType));
  }

  // DELETE PERMANENTLY

  deleteNotes() {
    this.store.dispatch(new DeleteNotesPermanently());
  }

  deleteFolders() {
    this.store.dispatch(new DeleteFoldersPermanently());
  }

}
