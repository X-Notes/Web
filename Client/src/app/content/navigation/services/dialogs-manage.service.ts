import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ChangeColorComponent } from 'src/app/shared/modal_components/change-color/change-color.component';
import { DialogService } from 'src/app/shared/modal_components/dialog.service';
import { EditingLabelsNoteComponent } from 'src/app/shared/modal_components/editing-labels-note/editing-labels-note.component';
import { GenericDeletionPopUpComponent } from 'src/app/shared/modal_components/generic-deletion-pop-up/generic-deletion-pop-up.component';
import { AddNotesInFolderComponent } from 'src/app/shared/modal_components/manage-notes-in-folder/add-notes-in-folder.component';
import { NoteHistoryPopUpComponent } from 'src/app/shared/modal_components/note-history-pop-up/note-history-pop-up.component';
import { OpenInnerSideComponent } from 'src/app/shared/modal_components/open-inner-side/open-inner-side.component';
import { RelatedNotesPopUpComponent } from 'src/app/shared/modal_components/related-notes-pop-up/related-notes-pop-up.component';
import { ShareComponent } from 'src/app/shared/modal_components/share/share.component';
import { ViewDocComponent } from 'src/app/shared/modal_components/view-doc/view-doc.component';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallFolder } from '../../folders/models/folder.model';
import { SmallNote } from '../../notes/models/small-note.model';
import { NoteStore } from '../../notes/state/notes-state';
import { SearchDialogComponent } from 'src/app/shared/modal_components/search-dialog/search-dialog.component';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DialogsManageService {
  constructor(
    private dialogService: DialogService,
    private store: Store,
    private pS: PersonalizationService,
  ) {}

  openAddRemoveRelatedNotesModal() {
    const isMobile = this.pS.isMobile();
    const panelClass = isMobile
      ? [this.getDefaultPanelClass(), 'custom-dialog-no-border-900']
      : this.getDefaultPanelClass();
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: isMobile ? '100vh' : '90vh',
      maxWidth: isMobile ? '100vw' : '90vw',
      height: isMobile ? '100vh' : '670px',
      width: isMobile ? '100vw' : '750px',
      autoFocus: false,
      panelClass,
    };
    const instance = this.dialogService.openDialog(OpenInnerSideComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openNoteHistoriesMobile(noteId: string) {
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '100%',
      autoFocus: false,
      panelClass: [this.getDefaultPanelClass(), 'custom-dialog-no-border-600', 'dialog-full-screen-600'],
      data: { noteId },
    };
    const instance = this.dialogService.openDialog(NoteHistoryPopUpComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openAddNotesToFolder() {
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: this.getDefaultPanelClass(),
    };
    const instance =  this.dialogService.openDialog(AddNotesInFolderComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openRelatedNotes(noteId: string, canEdit: boolean) {
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      height: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      autoFocus: false,
      panelClass: [this.getDefaultPanelClass(), 'custom-dialog-no-border-900'],
      data: { canEdit, noteId },
    };
    const instance = this.dialogService.openDialog(RelatedNotesPopUpComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openChangeLabels() {
    let labelIds: string[] = [];
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      labelIds = this.store.selectSnapshot(NoteStore.oneFull).labels.map((label) => label.id);
    } else {
      labelIds = this.store.selectSnapshot(NoteStore.labelsIds);
    }
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '100%',
      autoFocus: false,
      panelClass: [this.getDefaultPanelClass(), 'custom-dialog-no-border-600', 'dialog-full-screen-600'],
      data: { labelIds: new Set(labelIds) },
    };
    const instance = this.dialogService.openDialog(EditingLabelsNoteComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openChangeColorDialog(currentWindowType: EntityPopupType, ids: string[]) {
    this.validateIds(ids);
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass: this.getDefaultPanelClass(),
      data: { currentWindowType, ids },
    };
    const instance = this.dialogService.openDialog(ChangeColorComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openSearchDialog() {
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '100vh',
      maxWidth: '100vw',
      panelClass: [this.getDefaultPanelClass(), 'custom-dialog-no-border-900', 'dialog-full-screen-900'],
    };
    const instance = this.dialogService.openDialog(SearchDialogComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openDeletionPopup(message: string, additionalMessage: string) {
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass: this.getDefaultPanelClass(),
      data: { message, additionalMessage },
    };
    const instance = this.dialogService.openDialog(GenericDeletionPopUpComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  viewDock(id: string) {
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '100%',
      maxWidth: '90vw',
      panelClass: this.getDefaultPanelClass(),
      data: id,
    };
    const instance =  this.dialogService.openDialog(ViewDocComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  openShareEntity(currentWindowType: EntityPopupType, ents: SmallNote[] | SmallFolder[], isInnerFolderNote: boolean, folderId?: string) {
    this.validateIds(ents);
    this.pS.isDialogActive$.next(true);
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        this.getTheme() === ThemeENUM.Light
          ? ['custom-dialog-class-light', 'custom-dialog-no-border-900', 'dialog-full-screen-900']
          : ['custom-dialog-class-dark',  'custom-dialog-no-border-900', 'dialog-full-screen-900'],
      data: { currentWindowType, ents, isInnerFolderNote, folderId },
    };
    const instance = this.dialogService.openDialog(ShareComponent, config);
    instance.afterClosed().pipe(take(1)).subscribe(() => {
      this.pS.isDialogActive$.next(false);
    });
    return instance;
  }

  getDefaultPanelClass(): string {
    return this.getTheme() === ThemeENUM.Light
      ? 'custom-dialog-class-light'
      : 'custom-dialog-class-dark';
  }

  getTheme(): ThemeENUM {
    return this.store.selectSnapshot(UserStore.getUserTheme);
  }

  private validateIds(ents: SmallNote[] | SmallFolder[] | string[]) {
    if (!ents || ents.length === 0) {
      throw new Error('Ids missing');
    }
  }
}
