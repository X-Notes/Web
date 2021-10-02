import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LockEncryptService } from 'src/app/content/notes/lock-encrypt.service';
import { FullNote } from 'src/app/content/notes/models/full-note.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { ChangeIsLockedFullNote, UpdateOneNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteTypeENUM } from '../../enums/note-types.enum';
import { PersonalizationService, shake } from '../../services/personalization.service';
import { SnackBarWrapperService } from '../../services/snackbar/snack-bar-wrapper.service';

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

  fullNote: FullNote;

  form: FormGroup;

  destroy = new Subject<void>();

  isSubmit = false;

  isOpenInInner = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private lockEncryptService: LockEncryptService,
    private router: Router,
    private snackService: SnackBarWrapperService,
    private pService: PersonalizationService,
    public dialogRef: MatDialogRef<LockComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; isRemove: boolean },
  ) {}

  async ngOnInit() {
    let id = this.data?.id;
    if (!id) {
      [id] = this.store.selectSnapshot(NoteStore.selectedIds);
    }
    if (!id) {
      this.fullNote = this.store.selectSnapshot(NoteStore.oneFull);
      this.isOpenInInner = true;
      this.setFormValidation(this.fullNote);
    } else {
      this.note = await this.getNote(id);
      this.setFormValidation(this.note);
    }
  }

  async getNote(id: string): Promise<SmallNote> {
    const type = this.store.selectSnapshot(AppStore.getTypeNote);
    const note = await this.store
      .select(NoteStore.getNote)
      .pipe(
        take(1),
        map((func) => func(id, type)),
      )
      .toPromise();
    return note;
  }

  setFormValidation(note: SmallNote | FullNote) {
    if (!note.isLocked) {
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

  get isLockedGeneric() {
    if (this.isOpenInInner) {
      return this.fullNote?.isLocked;
    }
    return this.note?.isLocked;
  }

  get isCurrentOperationButton() {
    if (!(this.note?.isLocked || this.fullNote?.isLocked) && !this.data.isRemove) {
      return 'modal.lockModal.save';
    }
    if ((this.note?.isLocked || this.fullNote?.isLocked) && this.data.isRemove) {
      return 'modal.lockModal.remove';
    }
    return 'modal.lockModal.сomeIn';
  }

  get isCurrentOperationHeader() {
    if (!(this.note?.isLocked || this.fullNote?.isLocked) && !this.data.isRemove) {
      return 'modal.lockModal.lock';
    }
    if ((this.note?.isLocked || this.fullNote?.isLocked) && this.data.isRemove) {
      return 'modal.lockModal.unDecrypt';
    }
    return 'modal.lockModal.unLock';
  }

  async decryptNote(note: SmallNote | FullNote) {
    const { data } = await this.lockEncryptService
      .decryptNote(note.id, this.form.controls.password.value)
      .toPromise();
    if (!data) {
      const message = await this.pService.getTranslateText('modal.lockModal.incorrect');
      this.snackService.buildNotification(message, null);
      return false;
    }
    return note;
  }

  async tryUnlockNote(note: SmallNote | FullNote) {
    const { data } = await this.lockEncryptService
      .tryUnlockNote(note.id, this.form.controls.password.value)
      .toPromise();
    if (!data) {
      const message = await this.pService.getTranslateText('modal.lockModal.incorrect');
      this.snackService.buildNotification(message, null);
      return false;
    }
    return true;
  }

  async encryptNote(note: SmallNote | FullNote) {
    const { data } = await this.lockEncryptService
      .encryptNote(
        note.id,
        this.form.controls.password.value,
        this.form.controls.confirmation.value,
      )
      .toPromise();
    return data;
  }

  async saveFullNote() {
    if (this.fullNote.isLocked && this.data?.isRemove) {
      const isSuccess = await this.decryptNote(this.fullNote);
      if (isSuccess) {
        const updatedNote = { ...this.fullNote };
        updatedNote.isLocked = false;
        this.store.dispatch(new ChangeIsLockedFullNote(false));
        this.store.dispatch(new UpdateOneNote(updatedNote as SmallNote, updatedNote.noteTypeId));
        this.dialogRef.close();
      }
      return;
    }
    if (!this.fullNote.isLocked) {
      const isSuccess = await this.encryptNote(this.fullNote);
      if (isSuccess) {
        const updatedNote = { ...this.fullNote };
        updatedNote.isLocked = true;
        this.store.dispatch(new ChangeIsLockedFullNote(true));
        this.store.dispatch(new UpdateOneNote(updatedNote as SmallNote, updatedNote.noteTypeId));
        const route = this.fullNote.noteTypeId;
        if (route && route !== NoteTypeENUM.Private) {
          this.router.navigate([`notes/${route}`]);
        } else {
          this.router.navigate(['notes']);
        }
        this.dialogRef.close();
      }
    }
  }

  async saveSmallNote() {
    if (this.note.isLocked && this.data?.isRemove) {
      const isSuccess = await this.decryptNote(this.note);
      if (isSuccess) {
        const updatedNote = { ...this.note };
        updatedNote.isLocked = false;
        this.router.navigate([`notes/${this.note.id}`]);
        this.store.dispatch(new UpdateOneNote(updatedNote, updatedNote.noteTypeId));
        this.dialogRef.close();
      }
      return;
    }
    if (this.note.isLocked) {
      const isSuccess = await this.tryUnlockNote(this.note);
      if (isSuccess) {
        this.router.navigate([`notes/${this.note.id}`]);
        this.dialogRef.close();
      }
    } else {
      const isSuccess = await this.encryptNote(this.note);
      if (isSuccess) {
        const updatedNote = { ...this.note };
        updatedNote.isLocked = true;
        this.router.navigate([`notes/${this.note.id}`]);
        this.store.dispatch(new UpdateOneNote(updatedNote, updatedNote.noteTypeId));
        this.dialogRef.close();
      }
    }
  }

  async save() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return;
    }
    if (this.isOpenInInner) {
      this.saveFullNote();
      return;
    }
    this.saveSmallNote();
  }
}
