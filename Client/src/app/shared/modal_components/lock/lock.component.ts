import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LockEncryptService } from 'src/app/content/notes/lock-encrypt.service';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService, shake } from '../../services/personalization.service';
import { SnackbarService } from '../../services/snackbar.service';

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
  note: SmallNote;

  form: FormGroup;

  destroy = new Subject<void>();

  isSubmit = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private lockEncryptService: LockEncryptService,
    private router: Router,
    private snackService: SnackbarService,
    private pService: PersonalizationService,
    public dialogRef: MatDialogRef<LockComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {}

  async ngOnInit() {
    let id = this.data?.id;
    if (!id) {
      [id] = this.store.selectSnapshot(NoteStore.selectedIds);
    }
    const type = this.store.selectSnapshot(AppStore.getTypeNote);
    this.note = await this.store
      .select(NoteStore.getNote)
      .pipe(
        take(1),
        map((func) => func(id, type)),
      )
      .toPromise();
    if (!this.note.isLocked) {
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

  get field() {
    return this.form.controls;
  }

  async save() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return;
    }
    const isNote = this.store.selectSnapshot(AppStore.isNote);
    if (isNote) {
      if (this.note.isLocked) {
        const { data } = await this.lockEncryptService
          .tryUnlockNote(this.note.id, this.form.controls.password.value)
          .toPromise();
        if (data) {
          this.router.navigate([`notes/${this.note.id}`]);
          this.dialogRef.close();
        }
        const message = await this.pService.getTranslateText('modal.lockModal.incorrect');
        this.snackService.openSnackBar(message, null, 'center');
      } else {
        const { data } = await this.lockEncryptService
          .encryptNote(
            this.note.id,
            this.form.controls.password.value,
            this.form.controls.confirmation.value,
          )
          .toPromise();
        if (data) {
          this.router.navigate([`notes/${this.note.id}`]);
          this.dialogRef.close();
        }
      }
    }
  }
}
