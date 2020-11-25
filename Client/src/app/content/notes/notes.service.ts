import { Injectable, OnDestroy } from '@angular/core';
import { UpdateColor } from './state/updateColor';
import { SmallNote } from './models/smallNote';
import { FullNote } from './models/fullNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { NoteStore } from './state/notes-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { CancelAllSelectedLabels, ClearUpdatelabelEvent } from './state/notes-actions';
import { UpdateLabelEvent } from './state/updateLabels';

@Injectable()
export class NotesService implements OnDestroy {

  labelsIds: Subscription;

  destroy = new Subject<void>();
  allNotes: SmallNote[] = [];
  notes: SmallNote[] = [];
  firstInitFlag = false;

  constructor(public pService: PersonalizationService, private store: Store,
              private murriService: MurriService) {

    this.store.select(NoteStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(NoteStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => await this.delete(x));


    this.store.select(NoteStore.getIsCanceled)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x === true) {
          await this.murriService.setOpacityTrueAsync(0, false);
          await this.murriService.wait(150);
          this.murriService.grid.destroy();
          this.notes = this.allNotes;
          await this.murriService.initMurriNoteAsync(this.store.selectSnapshot(AppStore.getTypeNote), true);
          await this.murriService.setOpacityTrueAsync(0);
          this.store.dispatch(new CancelAllSelectedLabels(false));
        }
      });

    this.store.select(NoteStore.updateLabelOnNoteEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (values: UpdateLabelEvent[]) => {
        for (const valuee of values) {
          const note = this.notes.find(x => x.id === valuee.id);
          if (note !== undefined) {
            note.labels = valuee.labels;
          }
        }
        if (values.length > 0) {
          await this.store.dispatch(new ClearUpdatelabelEvent()).toPromise();
          await this.murriService.refreshLayoutAsync();
        }
      });

    this.store.select(NoteStore.selectedIds)
      .pipe(takeUntil(this.destroy))
      .subscribe(ids => {
        if (ids) {
          for (const note of this.notes) {
            if (ids.some(x => x === note.id)) {
              note.isSelected = true;
            } else {
              note.isSelected = false;
            }
          }
        }
      });

    this.store.select(NoteStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => {
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

  ngOnDestroy(): void {
    console.log('note destroy');
    this.destroy.next();
    this.destroy.complete();
    this.labelsIds.unsubscribe();
  }

  transformNotes(notes: SmallNote[]) {
    notes = [...notes];
    return notes.map(note => {
      return {...note, isSelected: false, lockRedirect: false};
    });
  }

  firstInit(notes: SmallNote[]) {
    this.allNotes = [...notes].map(note => { note = { ...note }; return note; });
    if (!this.isFiltedMode()) {
    this.notes = this.allNotes;
    } else {
      const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
      this.notes = this.allNotes.filter(x => x.labels.some(label => ids.some(z => z === label.id)));
    }
    this.labelsIds = this.store.select(NoteStore.getSelectedLabelFilter).subscribe(async (x) => await this.UpdateLabelSelected(x));
    this.firstInitFlag = true;
  }

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (this.notes.length > 0) {
        this.notes.find(x => x.id === update.id).color = update.color;
      }
    }
  }

  changeColorHandlerFullNote(note: FullNote, updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (note.id === update.id) {
        note.color = update.color;
      }
    }
  }

  async delete(ids: string[]) {
    if (ids.length > 0) {
      this.notes = this.notes.filter(x => !ids.some(z => z === x.id));
      await this.murriService.refreshLayoutAsync();
    }
  }

  async UpdateLabelSelected(ids: number[]) {
    console.log('ids labels');
    if (ids.length !== 0 && this.firstInitFlag) {
      console.log('in');
      await this.murriService.setOpacityTrueAsync(0, false);
      await this.murriService.wait(150);
      this.murriService.grid.destroy();
      this.notes = this.allNotes.filter(x => x.labels.some(label => ids.some(z => z === label.id)));
      await this.murriService.initMurriNoteAsync(this.store.selectSnapshot(AppStore.getTypeNote), false);
      await this.murriService.setOpacityTrueAsync(0);
    }
  }

  isFiltedMode() {
    const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
    return ids.length > 0;
  }

  addToDom(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [...notes.map(note => { note = { ...note }; return note; }).reverse(), ...this.notes];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, { index: 0, layout: true });
        }
      }, 0);
    }
  }

  addToDomAppend(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [...notes.map(note => { note = { ...note }; return note; }), ...this.notes];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, { index: -1, layout: true });
        }
      }, 0);
    }
  }

}
