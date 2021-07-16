import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { Router } from '@angular/router';
import {
  CancelAllSelectedLabels,
  ClearAddToDomNotes,
  ClearUpdatelabelEvent,
  LoadNotes,
  SelectIdNote,
  UnSelectIdNote,
  UpdateOneNote,
} from './state/notes-actions';
import { UpdateLabelEvent } from './state/update-labels.model';
import { NoteStore } from './state/notes-state';
import { SmallNote } from './models/small-note.model';
import { UpdateColor } from './state/update-color.model';
import { DialogsManageService } from '../navigation/dialogs-manage.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ApiServiceNotes } from './api-notes.service';
import { NotesUpdaterService } from './notes-updater.service';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import {
  FeaturesEntitiesService,
  OrderFilterEntity,
} from 'src/app/shared/services/features-entities.service';

@Injectable()
export class NotesService extends FeaturesEntitiesService<SmallNote> implements OnDestroy {
  // TODO TWO SEPARATE COMPONENTS FOR NOTES AND FOLDERS
  labelsIds: Subscription;

  destroy = new Subject<void>();

  firstInitFlag = false;

  sortedNoteByTypeId: SortedByENUM = null;

  constructor(
    public pService: PersonalizationService,
    store: Store,
    murriService: MurriService,
    private router: Router,
    private dialogsManageService: DialogsManageService,
    private apiService: ApiServiceNotes,
    private updateService: NotesUpdaterService,
  ) {
    super(store, OrderFilterEntity.Note, murriService);
    this.store
      .select(NoteStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.changeColorHandler(x));

    this.store
      .select(NoteStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => this.deleteFromDom(x));

    this.store
      .select(NoteStore.getIsCanceled)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x === true) {
          await this.murriService.setOpacityFlagAsync(0, false);
          await this.murriService.wait(150);
          this.murriService.grid.destroy();

          const tempNotes = this.transformSpread(this.getNotesByCurrentType);
          this.entities = this.orderBy(tempNotes);

          const roadType = this.store.selectSnapshot(AppStore.getTypeNote);

          const isDraggable = roadType !== NoteTypeENUM.Shared && this.isSortable;
          await this.murriService.initMurriNoteAsync(roadType, isDraggable);

          await this.murriService.setOpacityFlagAsync(0);
          this.store.dispatch(new CancelAllSelectedLabels(false));
        }
      });

    this.store
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

    this.store
      .select(NoteStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe((ids) => {
        if (ids) {
          for (const note of this.entities) {
            if (ids.some((x) => x === note.id)) {
              note.isSelected = true;
            } else {
              note.isSelected = false;
            }
          }
        }
      });

    this.store
      .select(NoteStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (x > 0) {
          for (const note of this.entities) {
            note.lockRedirect = true;
          }
        } else {
          for (const note of this.entities) {
            note.lockRedirect = false;
          }
        }
      });

    this.store
      .select(UserStore.getPersonalizationSettings)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (pr) => {
        if (this.sortedNoteByTypeId && this.sortedNoteByTypeId !== pr.sortedNoteByTypeId) {
          this.sortedNoteByTypeId = pr.sortedNoteByTypeId;
          await this.changeOrderTypeHandler();
        } else {
          this.sortedNoteByTypeId = pr.sortedNoteByTypeId;
        }
      });

    this.store
      .select(NoteStore.notesAddingToDOM)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (x.length > 0) {
          this.addToDom(x);
          this.store.dispatch(ClearAddToDomNotes);
        }
      });
  }

  get getNotesByCurrentType() {
    switch (this.store.selectSnapshot(AppStore.getTypeNote)) {
      case NoteTypeENUM.Private: {
        return this.store.selectSnapshot(NoteStore.privateNotes);
      }
      case NoteTypeENUM.Shared: {
        return this.store.selectSnapshot(NoteStore.sharedNotes);
      }
      case NoteTypeENUM.Archive: {
        return this.store.selectSnapshot(NoteStore.archiveNotes);
      }
      case NoteTypeENUM.Deleted: {
        return this.store.selectSnapshot(NoteStore.deletedNotes);
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
  }

  get isSortable() {
    return (
      this.store.selectSnapshot(UserStore.getPersonalizationSettings).sortedNoteByTypeId ===
      SortedByENUM.CustomOrder
    );
  }

  async changeOrderTypeHandler() {
    await this.murriService.setOpacityFlagAsync(0, false);
    await this.murriService.wait(150);
    this.murriService.grid.destroy();
    this.entities = this.orderBy(this.entities);
    const roadType = this.store.selectSnapshot(AppStore.getTypeNote);
    const isDraggable = roadType !== NoteTypeENUM.Shared && this.isSortable;
    this.murriService.initMurriNoteAsync(roadType, isDraggable);
    await this.murriService.setOpacityFlagAsync(0);
  }

  murriInitialise(refElements: QueryList<ElementRef>, noteType: NoteTypeENUM) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (
        z.length === this.entities.length &&
        this.entities.length !== 0 &&
        !this.firstInitedMurri
      ) {
        const isDraggable =
          !this.isFiltedMode && noteType !== NoteTypeENUM.Shared && this.isSortable;
        await this.murriService.initMurriNoteAsync(noteType, isDraggable);

        await this.firstInitMurri();

        await this.loadNotesWithUpdates();
      }
      await this.synchronizeState(refElements);
    });
  }

  async loadNotesWithUpdates() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.updateService.ids$.pipe(takeUntil(this.destroy)).subscribe(async (ids) => {
      if (ids.length > 0) {
        const notes = await this.apiService.getNotesMany(ids, pr).toPromise();
        const actionsForUpdate = notes.map((note) => new UpdateOneNote(note, note.noteTypeId));
        this.store.dispatch(actionsForUpdate);
        const transformNotes = this.transformSpread(notes);
        transformNotes.forEach((note) => {
          const index = this.entities.findIndex((x) => x.id === note.id);
          this.entities[index].contents = note.contents;
        });
        await this.murriService.refreshLayoutAsync();
        this.updateService.ids$.next([]);
      }
    });
  }

  async loadNotes(typeENUM: NoteTypeENUM) {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    await this.store.dispatch(new LoadNotes(typeENUM, pr)).toPromise();
    const types = Object.values(NoteTypeENUM).filter(
      (z) => typeof z === 'number' && z !== typeENUM,
    );
    const actions = types.map((t: NoteTypeENUM) => new LoadNotes(t, pr));
    this.store.dispatch(actions);
  }

  highlightNote(note) {
    if (!note.isSelected) {
      this.store.dispatch(new SelectIdNote(note.id));
    } else {
      this.store.dispatch(new UnSelectIdNote(note.id));
    }
  }

  toNote(note) {
    const isSelectedMode = this.store.selectSnapshot(NoteStore.selectedCount) > 0;
    if (isSelectedMode) {
      this.highlightNote(note);
    } else {
      if (note.isLocked) {
        this.dialogsManageService.lock(note.id);
        return;
      }
      this.router.navigate([`notes/${note.id}`]);
    }
  }

  ngOnDestroy(): void {
    console.log('note destroy');
    this.destroy.next();
    this.destroy.complete();
    this.labelsIds?.unsubscribe();
  }

  async firstInit() {
    let tempNotes = this.transformSpread(this.getNotesByCurrentType);
    tempNotes = this.orderBy(tempNotes);

    if (!this.isFiltedMode) {
      this.entities = tempNotes;
    } else {
      const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
      this.entities = tempNotes.filter((x) =>
        x.labels.some((label) => ids.some((z) => z === label.id)),
      );
    }

    super.initState();

    this.labelsIds = this.store
      .select(NoteStore.getSelectedLabelFilter)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x) {
          await this.updateLabelSelected(x);
        }
      });
    this.firstInitFlag = true;

    const noteIds = this.entities.map((x) => x.id);
    const additionalInfo = await this.apiService.getAdditionalInfos(noteIds).toPromise();
    for (const info of additionalInfo) {
      const noteIndex = this.entities.findIndex((x) => x.id == info.noteId);
      this.entities[noteIndex].additionalInfo = info;
    }
  }

  async updateLabelSelected(ids: string[]) {
    if (ids.length !== 0 && this.firstInitFlag) {
      await this.murriService.setOpacityFlagAsync(0, false);
      await this.murriService.wait(150);
      this.murriService.grid.destroy();

      let tempNotes = this.transformSpread(this.getNotesByCurrentType).filter((x) =>
        x.labels.some((label) => ids.some((z) => z === label.id)),
      );
      this.entities = this.orderBy(tempNotes);

      const roadType = this.store.selectSnapshot(AppStore.getTypeNote);
      await this.murriService.initMurriNoteAsync(roadType, false);
      await this.murriService.setOpacityFlagAsync(0);
    }
  }

  get isFiltedMode() {
    return this.store.selectSnapshot(NoteStore.getSelectedLabelFilter).length > 0;
  }
}
