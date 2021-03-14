import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { Router } from '@angular/router';
import {
  CancelAllSelectedLabels,
  ClearUpdatelabelEvent,
  LoadNotes,
  SelectIdNote,
  UnSelectIdNote,
} from './state/notes-actions';
import { UpdateLabelEvent } from './state/updateLabels';
import { NoteStore } from './state/notes-state';
import { SmallNote } from './models/smallNote';
import { UpdateColor } from './state/updateColor';

@Injectable()
export class NotesService implements OnDestroy {
  labelsIds: Subscription;

  destroy = new Subject<void>();

  allNotes: SmallNote[] = [];

  notes: SmallNote[] = [];

  firstInitFlag = false;

  firstInitedMurri = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private murriService: MurriService,
    private router: Router,
  ) {
    this.store
      .select(NoteStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => this.changeColorHandler(x));

    this.store
      .select(NoteStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => this.delete(x));

    this.store
      .select(NoteStore.getIsCanceled)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x === true) {
          await this.murriService.setOpacityTrueAsync(0, false);
          await this.murriService.wait(150);
          this.murriService.grid.destroy();
          this.notes = this.allNotes;
          const roadType = this.store.selectSnapshot(AppStore.getTypeNote);
          const type = this.store
            .selectSnapshot(AppStore.getNoteTypes)
            .find((z) => z.name === roadType);
          await this.murriService.initMurriNoteAsync(type, true);
          await this.murriService.setOpacityTrueAsync(0);
          this.store.dispatch(new CancelAllSelectedLabels(false));
        }
      });

    this.store
      .select(NoteStore.updateLabelOnNoteEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (values: UpdateLabelEvent[]) => {
        for (const valuee of values) {
          const note = this.notes.find((x) => x.id === valuee.id);
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
          for (const note of this.notes) {
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
          for (const note of this.notes) {
            note.lockRedirect = true;
          }
        } else {
          for (const note of this.notes) {
            note.lockRedirect = false;
          }
        }
      });
  }

  murriInitialise(refElements: QueryList<ElementRef>, noteType: NoteTypeENUM) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.notes.length && !this.firstInitedMurri) {
        const type = this.store
          .selectSnapshot(AppStore.getNoteTypes)
          .find((x) => x.name === noteType);
        this.murriService.initMurriNote(type, !this.isFiltedMode());
        await this.murriService.setOpacityTrueAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  async loadNotes(typeENUM: NoteTypeENUM) {
    const types = this.store.selectSnapshot(AppStore.getNoteTypes);
    const type = types.find((x) => x.name === typeENUM);
    await this.store.dispatch(new LoadNotes(type.id, type)).toPromise();

    const actions = types.filter((x) => x.id !== type.id).map((t) => new LoadNotes(t.id, t));
    this.store.dispatch(actions);
  }

  highlightNote(note) {
    if (!note.isSelected) {
      const labelsIds = note.labels.map((x) => x.id);
      this.store.dispatch(new SelectIdNote(note.id, labelsIds));
    } else {
      this.store.dispatch(new UnSelectIdNote(note.id));
    }
  }

  toNote(note) {
    const isSelectedMode = this.store.selectSnapshot(NoteStore.selectedCount) > 0;
    if (isSelectedMode) {
      this.highlightNote(note);
    } else {
      this.router.navigate([`notes/${note.id}`]);
    }
  }

  ngOnDestroy(): void {
    console.log('note destroy');
    this.destroy.next();
    this.destroy.complete();
    this.labelsIds.unsubscribe();
  }

  transformNotes = (items: SmallNote[]) => {
    const notes = [...items];
    return notes.map((note) => {
      return { ...note, isSelected: false, lockRedirect: false };
    });
  };

  firstInit(notes: SmallNote[]) {
    this.allNotes = [...notes].map((x) => {
      return { ...x };
    });
    if (!this.isFiltedMode()) {
      this.notes = this.allNotes;
    } else {
      const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
      this.notes = this.allNotes.filter((x) =>
        x.labels.some((label) => ids.some((z) => z === label.id)),
      );
    }
    this.labelsIds = this.store
      .select(NoteStore.getSelectedLabelFilter)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x) {
          await this.UpdateLabelSelected(x);
        }
      });
    this.firstInitFlag = true;
  }

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (this.notes.length > 0) {
        this.notes.find((x) => x.id === update.id).color = update.color;
      }
    }
  }

  async delete(ids: string[]) {
    if (ids.length > 0) {
      this.notes = this.notes.filter((x) => !ids.some((z) => z === x.id));
      await this.murriService.refreshLayoutAsync();
    }
  }

  async UpdateLabelSelected(ids: string[]) {
    console.log('ids labels');
    if (ids.length !== 0 && this.firstInitFlag) {
      console.log('in');
      await this.murriService.setOpacityTrueAsync(0, false);
      await this.murriService.wait(150);
      this.murriService.grid.destroy();
      this.notes = this.allNotes.filter((x) =>
        x.labels.some((label) => ids.some((z) => z === label.id)),
      );
      const roadType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store
        .selectSnapshot(AppStore.getNoteTypes)
        .find((x) => x.name === roadType);
      await this.murriService.initMurriNoteAsync(type, false);
      await this.murriService.setOpacityTrueAsync(0);
    }
  }

  isFiltedMode() {
    const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
    return ids.length > 0;
  }

  addToDom(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [
        ...notes
          .map((note) => {
            return { ...note };
          })
          .reverse(),
        ...this.notes,
      ];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i += 1) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, { index: 0, layout: true });
        }
      }, 0);
    }
  }
}
