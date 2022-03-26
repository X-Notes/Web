import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { LockEncryptService } from 'src/app/content/notes/lock-encrypt.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { ChangeIsLockedFullNote, UpdateOneNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { shake } from '../../services/personalization.service';
import { SnackBarWrapperService } from '../../services/snackbar/snack-bar-wrapper.service';

export enum LockPopupState {
  Lock,
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
    private router: Router,
    private snackService: SnackBarWrapperService,
    public dialogRef: MatDialogRef<LockComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; state: LockPopupState; isCallActionAfterSave: boolean },
  ) {
    this.state = data.state;
    if (!data.id) {
      throw new Error('id not seted');
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

  getNote(id: string): SmallNote {
    return this.store.selectSnapshot(NoteStore.getSmallNotes).find((x) => x.id === id);
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

  setLockedInState(isLocked: boolean) {
    const updatedNote = { ...this.getNote(this.data.id) };
    updatedNote.isLocked = isLocked;
    this.store.dispatch(new UpdateOneNote(updatedNote));
    this.store.dispatch(new ChangeIsLockedFullNote(isLocked));
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
          if (this.data.isCallActionAfterSave) {
            this.setLockedInState(true);
            this.router.navigate([`notes/${this.data.id}`]);
          }
          this.dialogRef.close(true);
        }
        break;
      }
      case LockPopupState.Unlock: {
        const isSuccess = await this.tryUnlockNote(this.data.id);
        if (isSuccess) {
          if (this.data.isCallActionAfterSave) {
            this.setLockedInState(false);
            this.router.navigate([`notes/${this.data.id}`]);
          }
          this.dialogRef.close(true);
        }
        break;
      }
      case LockPopupState.RemoveLock: {
        const isSuccess = await this.decryptNote(this.data.id);
        if (isSuccess) {
          if (this.data.isCallActionAfterSave) {
            this.setLockedInState(false);
            this.router.navigate([`notes/${this.data.id}`]);
          }
          this.dialogRef.close(true);
        }
        break;
      }
    }
  }
}
