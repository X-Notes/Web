/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { LanguagesENUM } from 'src/app/shared/enums/LanguagesENUM';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { BaseChangeTypeSmallFolder } from '../folders/state/folders-actions';
import { BaseChangeTypeSmallNote } from '../notes/state/notes-actions';

@Injectable({
  providedIn: 'root',
})
export class SnackBarWrapperService {
  constructor(private snackService: SnackbarService, private store: Store) {}

  // eslint-disable-next-line class-methods-use-this
  getNotesNaming(isMany: boolean, language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return isMany ? 'Notes' : 'Note';
      }
      case LanguagesENUM.russian: {
        return isMany ? 'Заметки' : 'Заметка';
      }
      case LanguagesENUM.ukraine: {
        return isMany ? 'Нотатки' : 'Нотаток';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getFoldersNaming(isMany: boolean, language: string): string {
    switch (language) {
      case LanguagesENUM.english: {
        return isMany ? 'Folders' : 'Folder';
      }
      case LanguagesENUM.russian: {
        return isMany ? 'Папки' : 'Папка';
      }
      case LanguagesENUM.ukraine: {
        return isMany ? 'Папки' : 'Папка';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getMoveToMessage(isMany: boolean, language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return isMany ? 'moved to' : 'moved to';
      }
      case LanguagesENUM.russian: {
        return isMany ? 'перенесены в' : 'перенесена в';
      }
      case LanguagesENUM.ukraine: {
        return isMany ? 'перенесені в' : 'перенесена в';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getUndoMessage(language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return 'Undo';
      }
      case LanguagesENUM.russian: {
        return 'Отменить';
      }
      case LanguagesENUM.ukraine: {
        return 'Відмінити';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  getArchiveEntityName(isMany: boolean, language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return 'archive';
      }
      case LanguagesENUM.russian: {
        return 'архив';
      }
      case LanguagesENUM.ukraine: {
        return 'архів';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  getPrivateEntityName(isMany: boolean, language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return 'private';
      }
      case LanguagesENUM.russian: {
        return 'личные';
      }
      case LanguagesENUM.ukraine: {
        return 'особисті';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  getDeleteEntityName(isMany: boolean, language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return 'bin';
      }
      case LanguagesENUM.russian: {
        return 'корзину';
      }
      case LanguagesENUM.ukraine: {
        return 'кошик';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  getSharedEntityName(isMany: boolean, language: string) {
    switch (language) {
      case LanguagesENUM.english: {
        return 'shared';
      }
      case LanguagesENUM.russian: {
        return 'общие';
      }
      case LanguagesENUM.ukraine: {
        return 'спільні';
      }
      default: {
        throw new Error('error');
      }
    }
  }

  buildArchive(
    callback: BaseChangeTypeSmallNote | BaseChangeTypeSmallFolder,
    entityNameOp: (isMany: boolean, language: string) => string,
  ) {
    const lname = this.store.selectSnapshot(UserStore.getUserLanguage).name;
    const message = this.concatMessages(
      lname,
      callback.selectedIds.length > 1,
      entityNameOp,
      this.getMoveToMessage,
      this.getArchiveEntityName,
    );
    this.buildNotification(message, this.getUndoMessage(lname), callback);
  }

  buildPrivate(
    callback: BaseChangeTypeSmallNote | BaseChangeTypeSmallFolder,
    entityNameOp: (isMany: boolean, language: string) => string,
  ) {
    const lname = this.store.selectSnapshot(UserStore.getUserLanguage).name;
    const message = this.concatMessages(
      lname,
      callback.selectedIds.length > 1,
      entityNameOp,
      this.getMoveToMessage,
      this.getArchiveEntityName,
    );
    this.buildNotification(message, this.getUndoMessage(lname), callback);
  }

  buildDelete(
    callback: BaseChangeTypeSmallNote | BaseChangeTypeSmallFolder,
    entityNameOp: (isMany: boolean, language: string) => string,
  ) {
    const lname = this.store.selectSnapshot(UserStore.getUserLanguage).name;
    const message = this.concatMessages(
      lname,
      callback.selectedIds.length > 1,
      entityNameOp,
      this.getMoveToMessage,
      this.getDeleteEntityName,
    );
    this.buildNotification(message, this.getUndoMessage(lname), callback);
  }

  buildNotification(message: string, undoMessage?: string, callbackAction?: any) {
    const snackbarRef = this.buildSnackBarRef(message, undoMessage);

    if (callbackAction) {
      snackbarRef
        .afterDismissed()
        .pipe(take(1))
        .subscribe((x) => {
          if (x.dismissedByAction) {
            this.store.dispatch(callbackAction);
          }
        });
    }
    return snackbarRef;
  }

  concatMessages(
    language: string,
    isMany: boolean,
    ...ops: ((isMany: boolean, language: string) => string)[]
  ): string {
    let result = '';
    // eslint-disable-next-line no-return-assign
    ops.forEach((func) => {
      result += func(isMany, language);
      result += ' ';
    });
    return result;
  }

  buildSnackBarRef(message: string, undo?: string) {
    return this.snackService.openSnackBar(message, undo);
  }
}
