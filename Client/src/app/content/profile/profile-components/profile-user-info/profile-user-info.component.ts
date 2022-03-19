import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxProfilePhotoSize } from 'src/app/core/defaults/constraints';
import { ShortUser } from 'src/app/core/models/short-user.model';
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

  uploadImageUserPhoto(event) {
    const file = event.target.files[0] as File;
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
        this.store.dispatch(new UpdateUserPhoto(formDate));
      }
    }
    // eslint-disable-next-line no-param-reassign
    event.target.value = null;
  }

  changeSource() {
    this.photoError = true;
  }
}
