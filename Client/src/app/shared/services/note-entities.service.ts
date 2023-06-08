import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import {
  ClearUpdatesUINotes,
  SelectIdNote,
  UnSelectIdNote,
} from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { UpdateNoteUI } from 'src/app/content/notes/state/update-note-ui.model';
import { LockPopupState } from '../modal_components/lock/lock.component';
import { FeaturesEntitiesService } from './features-entities.service';
import { MurriService } from './murri.service';

export abstract class NoteEntitiesService extends FeaturesEntitiesService<SmallNote> {
  destroy = new Subject<void>();

  constructor(
    private dialogsManageService: DialogsManageService,
    public store: Store,
    murriService: MurriService,
    public apiService: ApiServiceNotes,
    protected router: Router,
  ) {
    super(store, murriService);

    this.store
      .select(NoteStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe((ids) => this.handleSelectEntities(ids));

    this.store
      .select(NoteStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((count) => this.handleLockRedirect(count));

    this.store
      .select(NoteStore.updateNotesEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (values: UpdateNoteUI[]) => {
        await this.updateNotes(values);
      });
  }

  async updateNotes(updates: UpdateNoteUI[]) {
    for (const value of updates) {
      const note = this.entities.find((x) => x.id === value.id) as SmallNote;
      if (note) {
        if (value?.removeLabelIds && value.removeLabelIds?.length > 0) {
          note.labels = note.labels?.filter((x) => !value.removeLabelIds?.some((id) => x.id === id));
        }
        if (value.addLabels && value.addLabels.length > 0) {
          const noteLabels = note.labels ?? [];
          note.labels = [...noteLabels, ...value.addLabels];
        }
        if (value.allLabels) {
          note.labels = value.allLabels;
        }
        note.color = value.color ?? note.color;
        note.title = value.title ?? note.title;
        note.isCanEdit = value.isCanEdit ?? note.isCanEdit;
        note.isLocked = value.isLocked ?? note.isLocked;
        note.isLockedNow = value.isLockedNow ?? note.isLockedNow;
        note.unlockedTime = value.unlockedTime ?? note.unlockedTime;
      }
    }
    if (updates.length > 0) {
      await this.store.dispatch(new ClearUpdatesUINotes()).toPromise();
      await this.murriService.refreshLayoutAsync();
    }
  }

  baseToNote(note: SmallNote, navigateFunc: () => Promise<boolean>) {
    const isSelectedMode = this.store.selectSnapshot(NoteStore.selectedCount) > 0;
    if (isSelectedMode) {
      this.highlightNote(note);
    } else {
      if (note.isLockedNow) {
        const callback = () => this.router.navigate([`notes/${note.id}`]);
        this.dialogsManageService.openLockDialog(note.id, LockPopupState.Unlock, callback);
        return;
      }
      navigateFunc();
    }
  }

  async loadAdditionNoteInformation(noteIds?: string[]) {
    noteIds = noteIds ?? this.entities.map((x) => x.id);
    if (noteIds.length > 0) {
      const additionalInfo = await this.apiService.getAdditionalInfos(noteIds).toPromise();
      for (const info of additionalInfo) {
        const noteIndex = this.entities.findIndex((x) => x.id === info.noteId);
        if (noteIndex !== -1) {
          this.entities[noteIndex].additionalInfo = info;
        }
      }
    }
  }

  highlightNote(note: SmallNote) {
    if (!note.isSelected) {
      this.store.dispatch(new SelectIdNote(note.id));
    } else {
      this.store.dispatch(new UnSelectIdNote(note.id));
    }
  }

  abstract toNote(note: SmallNote): void;

  abstract navigateFunc(note: SmallNote): Promise<boolean>;
}
