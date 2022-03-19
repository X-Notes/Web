import { Injectable } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import {
  ChangeTypeFolder,
  ChangeTypeFullFolder,
  CopyFolders,
  DeleteFoldersPermanently,
} from '../folders/state/folders-actions';
import { FolderStore } from '../folders/state/folders-state';
import { DialogsManageService } from './dialogs-manage.service';

@Injectable({
  providedIn: 'root',
})
export class MenuButtonsFoldersService {
  constructor(
    private store: Store,
    private sbws: SnackBarWrapperService,
    private apiTranslate: TranslateService,
    private dialogsService: DialogsManageService,
  ) {}

  setDeleteFolders = () => {
    const ids = this.getSelectedFolderIds();
    const message =
      this.sbws.getFoldersNaming(ids.length > 1) +
      this.sbws.getMoveToMessage(ids.length > 1) +
      this.apiTranslate.instant('snackBar.toBin');
    const successCallback = () =>
      this.successFolderCallback(
        ids,
        this.getSelectedFolderType(),
        FolderTypeENUM.Deleted,
        message,
      );
    const command = new ChangeTypeFolder(
      FolderTypeENUM.Deleted,
      ids,
      false,
      this.permissionsErrorMessage(),
      successCallback,
    );
    this.store.dispatch(command);
  };

  setPrivateFolders = () => {
    const ids = this.getSelectedFolderIds();
    const message =
      this.sbws.getFoldersNaming(ids.length > 1) +
      this.sbws.getMoveToMessage(ids.length > 1) +
      this.apiTranslate.instant('snackBar.toPrivate');
    const successCallback = () =>
      this.successFolderCallback(
        ids,
        this.getSelectedFolderType(),
        FolderTypeENUM.Private,
        message,
      );
    const command = new ChangeTypeFolder(
      FolderTypeENUM.Private,
      ids,
      false,
      this.permissionsErrorMessage(),
      successCallback,
    );
    this.store.dispatch(command);
  };

  archiveFolders = () => {
    const ids = this.getSelectedFolderIds();
    const message =
      this.sbws.getFoldersNaming(ids.length > 1) +
      this.sbws.getMoveToMessage(ids.length > 1) +
      this.apiTranslate.instant('snackBar.archive');
    const successCallback = () =>
      this.successFolderCallback(
        ids,
        this.getSelectedFolderType(),
        FolderTypeENUM.Archive,
        message,
      );
    const command = new ChangeTypeFolder(
      FolderTypeENUM.Archive,
      ids,
      false,
      this.permissionsErrorMessage(),
      successCallback,
    );
    this.store.dispatch(command);
  };

  copyFolders() {
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

  openDeletionNoteModal(): void {
    const instance = this.dialogsService.openDeletionPopup(
      'modal.deletionModal.sureDeleteFolders',
      'modal.deletionModal.additionalMessage',
    );
    instance
      .afterClosed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x) {
          this.deleteFolders();
        }
      });
  }

  private async deleteFolders(): Promise<MatSnackBarRef<TextOnlySnackBar>> {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    await this.store.dispatch(new DeleteFoldersPermanently(ids)).toPromise();
    const message =
      ids.length > 1
        ? this.apiTranslate.instant('snackBar.foldersPermDeleted')
        : this.apiTranslate.instant('snackBar.folderPermDeleted');
    return this.sbws.buildNotification(message, null);
  }

  private permissionsErrorMessage = (): string =>
    this.apiTranslate.instant('snackBar.onlyAuthorCanMoveIt');

  private successFolderCallback = (
    ids: string[],
    typeFrom: FolderTypeENUM,
    typeTo: FolderTypeENUM,
    message: string,
  ) => {
    this.sbws.build(() => {
      this.store.dispatch(this.getRevertActionFolders(typeFrom, ids));
      this.changeFullFolderType(typeFrom);
    }, message);
    this.changeFullFolderType(typeTo);
  };

  private getRevertActionFolders = (type: FolderTypeENUM, ids): ChangeTypeFolder => {
    const types = FolderTypeENUM;
    switch (type) {
      case types.Private: {
        return new ChangeTypeFolder(FolderTypeENUM.Private, ids, true);
      }
      case types.Shared: {
        return new ChangeTypeFolder(
          FolderTypeENUM.Private,
          ids,
          true,
          null,
          null,
          RefTypeENUM.Viewer,
        );
      }
      case types.Archive: {
        return new ChangeTypeFolder(FolderTypeENUM.Archive, ids, true);
      }
      case types.Deleted: {
        return new ChangeTypeFolder(FolderTypeENUM.Deleted, ids, true);
      }
      default: {
        throw new Error('incorrect type');
      }
    }
  };

  private getSelectedFolderType(): FolderTypeENUM {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folder = this.store.selectSnapshot(FolderStore.full);
      return folder.folderTypeId;
    }
    return this.store.selectSnapshot(AppStore.getTypeFolder);
  }

  private getSelectedFolderIds(): string[] {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folder = this.store.selectSnapshot(FolderStore.full);
      return [folder.id];
    }
    return this.store.selectSnapshot(FolderStore.selectedIds);
  }

  private changeFullFolderType(typeTo: FolderTypeENUM) {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      this.store.dispatch(new ChangeTypeFullFolder(typeTo));
    }
  }
}
