import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxProfilePhotoSize } from 'src/app/core/defaults/constraints';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { ShowSnackNotification } from 'src/app/core/stateApp/app-action';
import { UpdateUserInfo, UpdateUserPhoto } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SnackBarTranlateHelperService } from 'src/app/shared/services/snackbar/snack-bar-tranlate-helper.service';

@Component({
  selector: 'app-profile-user-info',
  templateUrl: './profile-user-info.component.html',
  styleUrls: ['./profile-user-info.component.scss'],
})
export class ProfileUserInfoComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  destroy = new Subject<void>();

  nameChanged: Subject<string> = new Subject<string>();

  public photoError = false;

  userName: string;

  spinnerActive = false;

  constructor(
    private store: Store,
    private snackbarTranslateHelper: SnackBarTranlateHelperService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.userName = this.store.selectSnapshot(UserStore.getUser).name;

    this.nameChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateTitleEntitesDelay))
      .subscribe((title) => {
        if (title) {
          const user = this.store.selectSnapshot(UserStore.getUser);
          if (user.name !== this.userName) {
            this.store.dispatch(new UpdateUserInfo(this.userName));
          }
        }
      });
  }

  userNameChange(text: string) {
    this.nameChanged.next(text);
  }

  async uploadImageUserPhoto(event, files: File[]) {
    const file = files[0];
    if (file) {
      if (file.size > maxProfilePhotoSize) {
        const language = this.store.selectSnapshot(UserStore.getUserLanguage);
        const message = this.snackbarTranslateHelper.getFileTooLargeTranslate(
          language,
          byteToMB(maxProfilePhotoSize),
        );
        this.store.dispatch(new ShowSnackNotification(message));
      } else {
        const formDate = new FormData();
        formDate.append('photo', file);
        this.spinnerActive = true;
        await this.store.dispatch(new UpdateUserPhoto(formDate)).toPromise();
        this.spinnerActive = false;
      }
    }
    // eslint-disable-next-line no-param-reassign
    if (event?.target) {
      event.target.value = null;
    }
  }

  changeSource() {
    this.photoError = true;
  }
}
