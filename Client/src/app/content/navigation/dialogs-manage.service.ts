import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { EditingLabelsNoteComponent } from 'src/app/shared/modal_components/editing-labels-note/editing-labels-note.component';
import { LockComponent } from 'src/app/shared/modal_components/lock/lock.component';
import { ManageNotesInFolderComponent } from 'src/app/shared/modal_components/manage-notes-in-folder/manage-notes-in-folder.component';
import { OpenInnerSideComponent } from 'src/app/shared/modal_components/open-inner-side/open-inner-side.component';
import { ShareComponent } from 'src/app/shared/modal_components/share/share.component';

@Injectable({
  providedIn: 'root',
})
export class DialogsManageService {
  constructor(private dialogService: DialogService, private store: Store) {}

  openRelatedNotesModal() {
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
    };
    return this.dialogService.openDialog(OpenInnerSideComponent, config);
  }

  openManageNotesInFolder() {
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
    };
    return this.dialogService.openDialog(ManageNotesInFolderComponent, config);
  }

  changeLabels() {
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
    };
    return this.dialogService.openDialog(EditingLabelsNoteComponent, config);
  }

  changeColor() {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
    };
    return this.dialogService.openDialog(ChangeColorComponent, config);
  }

  lock(id?) {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
      data: { id },
    };
    console.log(id);
    return this.dialogService.openDialog(LockComponent, config);
  }

  shareEntity() {
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? ['custom-dialog-class-light', 'sharing-modal']
          : ['custom-dialog-class-dark', 'sharing-modal'],
    };
    return this.dialogService.openDialog(ShareComponent, config);
  }

  getTheme() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    return theme.name;
  }
}
