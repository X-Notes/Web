import { Injectable } from '@angular/core';
import { MenuItem } from './menu_item';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MatDialogConfig } from '@angular/material/dialog';
import { Theme } from 'src/app/shared/enums/Theme';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';

@Injectable()
export class MenuButtonsService {

  constructor(private store: Store,
              private dialogService: DialogService, ) {
  }
  public items: MenuItem[] = [];

  private notesItems: MenuItem[] = [
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

  private foldersItems: MenuItem[] = [
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

  setNotes() {
    this.items = this.notesItems;
  }
  setFolders() {
    this.items = this.foldersItems;
  }
  setInnerNote() {
    this.items = this.noteInnerItems;
  }
  setInnerFolder() {

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

}
