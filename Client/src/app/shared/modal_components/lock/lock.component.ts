import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { LockEncryptService } from 'src/app/content/notes/lock-encrypt.service';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { shake } from '../../services/personalization.service';
import { SnackBarWrapperService } from '../../services/snackbar/snack-bar-wrapper.service';

export enum LockPopupState {
  Lock = 1,
  Unlock,
  RemoveLock,
}

const CompareValidator = (first: string, second: string) => {
  return (fg: FormGroup) => {
    const firstField = fg.controls[first];
    const secondField = fg.controls[second];

    if (firstField?.errors && !secondField?.errors?.isMatch) {
      return;
    }

    if (firstField.value !== secondField.value) {
      secondField.setErrors({ isMatch: true });
    } else {
      secondField.setErrors(null);
    }
  };
};

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss'],
  animations: [shake],
})
export class LockComponent implements OnInit, OnDestroy {
  form: FormGroup;

  destroy = new Subject<void>();

  isSubmit = false;

  state: LockPopupState;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private lockEncryptService: LockEncryptService,
    private snackService: SnackBarWrapperService,
    public dialogRef: MatDialogRef<LockComponent>,
    private translate: TranslateService,
    private updaterEntitiesService: UpdaterEntitiesService,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; state: LockPopupState; callback: () => Promise<any> },
  ) {
    this.state = data.state;
    if (!data.id) {
      throw new Error('id not seted');
    }
    if (!data.state) {
      throw new Error('state not seted');
    }
  }

  get field() {
    return this.form.controls;
  }

  get isDisplayUnlockTime() {
    return this.state === LockPopupState.Unlock;
  }

  get isDisplaySecondField() {
    return this.state === LockPopupState.Lock;
  }

  get bottomButtonName() {
    switch (this.state) {
      case LockPopupState.Lock: {
        return 'modal.lockModal.save';
      }
      case LockPopupState.Unlock: {
        return 'modal.lockModal.сomeIn';
      }
      case LockPopupState.RemoveLock: {
        return 'modal.lockModal.remove';
      }
    }
  }

  get header() {
    switch (this.state) {
      case LockPopupState.Lock: {
        return 'modal.lockModal.lock';
      }
      case LockPopupState.Unlock: {
        return 'modal.lockModal.unLock';
      }
      case LockPopupState.RemoveLock: {
        return 'modal.lockModal.unDecrypt';
      }
    }
  }

  ngOnInit() {
    this.setFormValidation();
  }

  setFormValidation() {
    if (this.state === LockPopupState.Lock) {
      this.form = this.fb.group(
        {
          password: [null, [Validators.required, Validators.minLength(6)]],
          confirmation: [null, Validators.required],
        },
        { validator: CompareValidator('password', 'confirmation') },
      );
    } else {
      this.form = this.fb.group({
        password: [null, [Validators.required, Validators.minLength(6)]],
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async decryptNote(noteId: string) {
    const result = await this.lockEncryptService
      .decryptNote(noteId, this.form.controls.password.value)
      .toPromise();
    if (!result.data) {
      const message = this.translate.instant('modal.lockModal.incorrect');
      this.snackService.buildNotification(message, null);
      return false;
    }
    return true;
  }

  async tryUnlockNote(noteId: string): Promise<boolean> {
    const result = await this.lockEncryptService
      .tryUnlockNote(noteId, this.form.controls.password.value)
      .toPromise();
    if (!result.data) {
      const message = this.translate.instant('modal.lockModal.incorrect');
      this.snackService.buildNotification(message, null);
      return false;
    }
    return true;
  }

  async encryptNote(noteId: string) {
    const { data } = await this.lockEncryptService
      .encryptNote(noteId, this.form.controls.password.value, this.form.controls.confirmation.value)
      .toPromise();
    return data;
  }

  async save() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return;
    }

    switch (this.state) {
      case LockPopupState.Lock: {
        const isSuccess = await this.encryptNote(this.data.id);
        if (isSuccess) {
          await this.updaterEntitiesService.setLockedInState(this.data.id, true, true);
          if (this.data.callback) {
            await this.data.callback();
          }
          this.dialogRef.close(true);
        }
        break;
      }
      case LockPopupState.Unlock: {
        const isSuccess = await this.tryUnlockNote(this.data.id);
        if (isSuccess) {
          await this.updaterEntitiesService.setLockedInState(this.data.id, null, false);
          this.updaterEntitiesService.lockNoteAfter(this.data.id);
          if (this.data.callback) {
            await this.data.callback();
          }
          this.dialogRef.close(true);
        }
        break;
      }
      case LockPopupState.RemoveLock: {
        const isSuccess = await this.decryptNote(this.data.id);
        if (isSuccess) {
          await this.updaterEntitiesService.setLockedInState(this.data.id, false, false);
          if (this.data.callback) {
            await this.data.callback();
          }
          this.dialogRef.close(true);
        }
        break;
      }
    }
  }
}
