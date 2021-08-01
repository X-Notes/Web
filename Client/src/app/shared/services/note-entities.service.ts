import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import {
  ClearUpdatelabelEvent,
  SelectIdNote,
  UnSelectIdNote,
} from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { UpdateLabelEvent } from 'src/app/content/notes/state/update-labels.model';
import { FeaturesEntitiesService } from './features-entities.service';
import { MurriService } from './murri.service';

export abstract class NoteEntitiesService extends FeaturesEntitiesService<SmallNote> {
  destroy = new Subject<void>();

  constructor(
    private dialogsManageService: DialogsManageService,
    public store: Store,
    public murriService: MurriService,
    public apiService: ApiServiceNotes,
  ) {
    super(store, murriService);

    this.store
      .select(NoteStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.changeColorHandler(x));

    this.store
      .select(NoteStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe((ids) => this.handleSelectEntities(ids));

    this.store
      .select(NoteStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((count) => this.handleLockRedirect(count));

    this.store // TODO DON`T WORK FOR INNE FOLDER
      .select(NoteStore.updateLabelOnNoteEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (values: UpdateLabelEvent[]) => {
        for (const valuee of values) {
          const note = this.entities.find((x) => x.id === valuee.id);
          if (note !== undefined) {
            note.labels = valuee.labels;
          }
        }
        if (values.length > 0) {
          await this.store.dispatch(new ClearUpdatelabelEvent()).toPromise();
          await this.murriService.refreshLayoutAsync();
        }
      });
  }

  abstract toNote(note: SmallNote);
  abstract navigateFunc(note: SmallNote): Promise<boolean>;

  baseToNote(note: SmallNote, navigateFunc: () => Promise<boolean>) {
    const isSelectedMode = this.store.selectSnapshot(NoteStore.selectedCount) > 0;
    if (isSelectedMode) {
      this.highlightNote(note);
    } else {
      if (note.isLocked) {
        this.dialogsManageService.lock(note.id);
        return;
      }
      navigateFunc();
    }
  }

  async loadAdditionNoteInformation() {
    const noteIds = this.entities.map((x) => x.id);
    const additionalInfo = await this.apiService.getAdditionalInfos(noteIds).toPromise();
    for (const info of additionalInfo) {
      const noteIndex = this.entities.findIndex((x) => x.id == info.noteId);
      this.entities[noteIndex].additionalInfo = info;
    }
  }

  highlightNote(note) {
    if (!note.isSelected) {
      this.store.dispatch(new SelectIdNote(note.id));
    } else {
      this.store.dispatch(new UnSelectIdNote(note.id));
    }
  }
}
