import { Injectable } from '@angular/core';
import { MenuItem } from './menu_item';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MatDialogConfig } from '@angular/material/dialog';
import { Theme } from 'src/app/shared/enums/Theme';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { CopyNotes, SetDeleteNotes, RestoreNotes } from '../notes/state/notes-actions';
import { CopyFolders, SetDeleteFolders, RestoreFolders } from '../folders/state/folders-actions';

@Injectable({providedIn: 'root'})
export class MenuButtonsService {

  constructor(private store: Store,
              private dialogService: DialogService, ) {
  }
  public items: MenuItem[] = [];

  private notesItemsPrivate: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setdeleteNotes.bind(this)
    }
  ];
  private notesItemsShared: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setdeleteNotes.bind(this)
    }
  ];
  private notesItemsDeleted: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    },
    {
      icon: 'restore',
      operation: this.restoreNotes.bind(this)
    }
  ];
  private notesItemsArchive: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setdeleteNotes.bind(this)
    }
  ];

  private foldersItemsPrivate: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setDeleteFolders.bind(this)
    }
  ];
  private foldersItemsShared: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setDeleteFolders.bind(this)
    }
  ];
  private foldersItemsDeleted: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    },
    {
      icon: 'restore',
      operation: this.restoreFolders.bind(this)
    }
  ];
  private foldersItemsArchive: MenuItem[] = [
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
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: this.setDeleteFolders.bind(this)
    }
  ];


  private noteInnerItems: MenuItem[] = [
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
      operation: () => 5
    },
    {
      icon: 'copy',
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    }
  ];
  private folderInnerItems: MenuItem[] = [
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
      operation: () => 5
    },
    {
      icon: 'copy',
      operation: () => 5
    },
    {
      icon: 'color',
      operation: () => 5
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
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    }
  ];

  setNotesPrivate() {
    this.items = this.notesItemsPrivate;
  }

  setNotesShared() {
    this.items = this.notesItemsShared;
  }

  setNotesDeleted() {
    this.items = this.notesItemsDeleted;
  }

  setNotesArchive() {
    this.items = this.notesItemsArchive;
  }

  setInnerNote() {
    this.items = this.noteInnerItems;
  }


  setFoldersPrivate() {
    this.items = this.foldersItemsPrivate;
  }
  setFoldersShared() {
    this.items = this.foldersItemsShared;
  }
  setFoldersArchive() {
    this.items = this.foldersItemsArchive;
  }
  setFoldersDeleted() {
    this.items = this.foldersItemsDeleted;
  }

  setInnerFolder() {
    this.items = this.folderInnerItems;
  }

  private changeColor() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig =  {
      width: '450px',
      minHeight: '380px',
      data: {
        title: 'Colors'
      },
      panelClass: theme === Theme.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark'
    };
    this.dialogService.openDialog(ChangeColorComponent, config);
  }

  private copyNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new CopyNotes(noteType));
  }

  private copyFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new CopyFolders(folderType));
  }

  private setdeleteNotes() {
    const noteType = this.store.selectSnapshot(AppStore.getNoteType);
    this.store.dispatch(new SetDeleteNotes(noteType));
  }

  private setDeleteFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new SetDeleteFolders(folderType));
  }

  private restoreNotes() {
    this.store.dispatch(new RestoreNotes());
  }

  private restoreFolders() {
    const folderType = this.store.selectSnapshot(AppStore.getFolderType);
    this.store.dispatch(new RestoreFolders());
  }

}
