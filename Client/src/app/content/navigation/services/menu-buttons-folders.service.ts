import { Injectable } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { SmallFolder } from '../../folders/models/folder.model';
import {
  ChangeTypeFolder,
  CopyFolders,
  DeleteFoldersPermanently,
} from '../../folders/state/folders-actions';
import { FolderStore } from '../../folders/state/folders-state';
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
    const folders = this.getSelectedFolderIds();
    const ids = folders.map(x => x.id);
    const message =
      this.sbws.getFoldersNaming(ids.length > 1) +
      this.sbws.getMoveToMessage(ids.length > 1) +
      this.apiTranslate.instant('snackBar.toBin');
    const successCallback = () =>
      this.successFolderCallback(folders, this.getSelectedFolderType(), message);
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
    const folders = this.getSelectedFolderIds();
    const ids = folders.map(x => x.id);
    const message =
      this.sbws.getFoldersNaming(ids.length > 1) +
      this.sbws.getMoveToMessage(ids.length > 1) +
      this.apiTranslate.instant('snackBar.toPrivate');
    const successCallback = () =>
      this.successFolderCallback(folders, this.getSelectedFolderType(), message);
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
    const folders = this.getSelectedFolderIds();
    const ids = folders.map(x => x.id);
    const message =
      this.sbws.getFoldersNaming(ids.length > 1) +
      this.sbws.getMoveToMessage(ids.length > 1) +
      this.apiTranslate.instant('snackBar.archive');
    const successCallback = () =>
      this.successFolderCallback(folders, this.getSelectedFolderType(), message);
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

  private successFolderCallback = (folders: SmallFolder[], typeFrom: FolderTypeENUM, message: string) => {
    this.sbws.build(() => {
      this.store.dispatch([...this.getRevertActionFolders(typeFrom, folders)]);
    }, message);
  };

  private getRevertActionFolders = (
    type: FolderTypeENUM,
    folders: SmallFolder[],
  ): ChangeTypeFolder[] => {
    const types = FolderTypeENUM;
    const ids = folders.map((x) => x.id);
    switch (type) {
      case types.Private: {
        return [new ChangeTypeFolder(FolderTypeENUM.Private, ids, true)];
      }
      case types.Shared: {
        const commands: ChangeTypeFolder[] = [];
        const viewersFolderIds = folders
          .filter((x) => x.refTypeId === RefTypeENUM.Viewer)
          .map((x) => x.id);
        const editorsFolderIds = folders
          .filter((x) => x.refTypeId === RefTypeENUM.Editor)
          .map((x) => x.id);
        if (viewersFolderIds.length > 0) {
          const command = new ChangeTypeFolder(
            FolderTypeENUM.Shared,
            viewersFolderIds,
            true,
            null,
            null,
            RefTypeENUM.Viewer,
          );
          commands.push(command);
        }
        if (editorsFolderIds.length > 0) {
          const command = new ChangeTypeFolder(
            FolderTypeENUM.Shared,
            editorsFolderIds,
            true,
            null,
            null,
            RefTypeENUM.Editor,
          );
          commands.push(command);
        }
        return commands;
      }
      case types.Archive: {
        return [new ChangeTypeFolder(FolderTypeENUM.Archive, ids, true)];
      }
      case types.Deleted: {
        return [new ChangeTypeFolder(FolderTypeENUM.Deleted, ids, true)];
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

  private getSelectedFolderIds(): SmallFolder[] {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      const folder = this.store.selectSnapshot(FolderStore.full);
      return [folder as SmallFolder];
    }
    return this.store.selectSnapshot(FolderStore.getSelectedFolders);
  }
}
