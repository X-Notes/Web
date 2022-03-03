import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { SelectIdNote, UnSelectIdNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { UpdateNoteUI } from 'src/app/content/notes/state/update-note-ui.model';
import { FeaturesEntitiesService } from './features-entities.service';
import { MurriService } from './murri.service';

export abstract class NoteEntitiesService extends FeaturesEntitiesService<SmallNote> {
  destroy = new Subject<void>();

  constructor(
    private dialogsManageService: DialogsManageService,
    public store: Store,
    murriService: MurriService,
    public apiService: ApiServiceNotes,
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

  changeColorHandler(updateColor: UpdateNoteUI[]) {
    for (const update of updateColor) {
      if (this.entities.length > 0) {
        this.entities.find((x) => x.id === update.id).color = update.color;
      }
    }
  }

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

  async loadAdditionNoteInformation(noteIds?: string[]) {
    noteIds = noteIds ?? this.entities.map((x) => x.id);
    if (noteIds.length > 0) {
      const additionalInfo = await this.apiService.getAdditionalInfos(noteIds).toPromise();
      for (const info of additionalInfo) {
        const noteIndex = this.entities.findIndex((x) => x.id === info.noteId);
        this.entities[noteIndex].additionalInfo = info;
      }
    }
  }

  highlightNote(note) {
    if (!note.isSelected) {
      this.store.dispatch(new SelectIdNote(note.id));
    } else {
      this.store.dispatch(new UnSelectIdNote(note.id));
    }
  }

  abstract toNote(note: SmallNote);

  abstract navigateFunc(note: SmallNote): Promise<boolean>;
}
