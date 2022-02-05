/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { ShowSnackNotification } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { PersonalizationService } from '../personalization.service';

@Injectable({
  providedIn: 'root',
})
export class SnackBarWrapperService {
  constructor(
    private snackService: SnackbarService,
    private store: Store,
    private prService: PersonalizationService,
    private translateService: TranslateService,
  ) {
    this.store.select(AppStore.getSnackBarNotification).subscribe((message) => {
      if (message) {
        this.buildNotification(message, null, null);
        this.store.dispatch(new ShowSnackNotification(null));
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getNotesNaming(isMany: boolean) {
    return isMany
      ? this.translateService.instant('snackBar.notes')
      : this.translateService.instant('snackBar.note');
  }

  // eslint-disable-next-line class-methods-use-this
  getFoldersNaming(isMany: boolean): string {
    return isMany
      ? this.translateService.instant('snackBar.folders')
      : this.translateService.instant('snackBar.folder');
  }

  getLabelsNaming(isMany: boolean): string {
    return isMany
      ? this.translateService.instant('snackBar.labels')
      : this.translateService.instant('snackBar.label');
  }

  // eslint-disable-next-line class-methods-use-this
  getMoveToMessage(isMany: boolean) {
    return isMany
      ? this.translateService.instant('snackBar.movedToMany')
      : this.translateService.instant('snackBar.movedToSingle');
  }

  build(callback: () => void, message: string) {
    this.buildNotification(message, callback, this.translateService.instant('snackBar.undo'));
  }

  buildNotification(
    message: string,
    callback: () => void,
    undoMessage?: string,
  ): MatSnackBarRef<TextOnlySnackBar> {
    const snackbarRef = this.buildSnackBarRef(message, undoMessage);
    this.prService.isSnackBarActive$.next(true);
    snackbarRef
      .onAction()
      .pipe(take(1))
      .subscribe(() => {
        this.prService.isSnackBarActive$.next(false);
        if (callback) {
          callback();
        }
      });
    return snackbarRef;
  }

  private buildSnackBarRef(message: string, undo?: string) {
    return this.snackService.openSnackBar(message, undo);
  }
}
