import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { EditingLabelsNoteComponent } from 'src/app/shared/modal_components/editing-labels-note/editing-labels-note.component';
import { GenericDeletionPopUpComponent } from 'src/app/shared/modal_components/generic-deletion-pop-up/generic-deletion-pop-up.component';
import { LockComponent, LockPopupState } from 'src/app/shared/modal_components/lock/lock.component';
import { AddNotesInFolderComponent } from 'src/app/shared/modal_components/manage-notes-in-folder/add-notes-in-folder.component';
import { OpenInnerSideComponent } from 'src/app/shared/modal_components/open-inner-side/open-inner-side.component';
import { ShareComponent } from 'src/app/shared/modal_components/share/share.component';
import { ViewDocComponent } from 'src/app/shared/modal_components/view-doc/view-doc.component';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';

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

  openAddNotesToFolder() {
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
    };
    return this.dialogService.openDialog(AddNotesInFolderComponent, config);
  }

  openChangeLabels() {
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

  openChangeColorDialog(currentWindowType: EntityPopupType, ids: string[]) {
    this.validateIds(ids);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
      data: { currentWindowType, ids },
    };
    return this.dialogService.openDialog(ChangeColorComponent, config);
  }

  openDeletionPopup(message: string, additionalMessage: string) {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
      data: { message, additionalMessage },
    };
    return this.dialogService.openDialog(GenericDeletionPopUpComponent, config);
  }

  openLockDialog(id: string, state: LockPopupState, isCallActionAfterSave: boolean = true) {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
      data: { id, state, isCallActionAfterSave },
    };
    return this.dialogService.openDialog(LockComponent, config);
  }

  viewDock(id: string) {
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? 'custom-dialog-class-light'
          : 'custom-dialog-class-dark',
      data: id,
    };
    return this.dialogService.openDialog(ViewDocComponent, config);
  }

  openShareEntity(currentWindowType: EntityPopupType, ids: string[]) {
    this.validateIds(ids);
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? ['custom-dialog-class-light', 'sharing-modal']
          : ['custom-dialog-class-dark', 'sharing-modal'],
      data: { currentWindowType, ids },
    };
    return this.dialogService.openDialog(ShareComponent, config);
  }

  getTheme(): ThemeENUM {
    return this.store.selectSnapshot(UserStore.getUserTheme);
  }

  private validateIds(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error('Ids missing');
    }
  }
}
