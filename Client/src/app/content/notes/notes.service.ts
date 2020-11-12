import { Injectable, OnDestroy } from '@angular/core';
import { UpdateColor } from './state/updateColor';
import { SmallNote } from './models/smallNote';
import { FullNote } from './models/fullNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { NoteStore } from './state/notes-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PaginationService } from 'src/app/shared/services/pagination.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class NotesService implements OnDestroy {

  labelsIds: Subscription;

  destroy = new Subject<void>();
  allNotes: SmallNote[] = [];
  notes: SmallNote[] = [];
  constructor(public pService: PersonalizationService, private store: Store,
              private murriService: MurriService,
              private pagService: PaginationService) {

    this.store.select(NoteStore.updateColorEvent)
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(NoteStore.removeFromMurriEvent)
      .subscribe(async (x) => await this.delete(x));

    this.pagService.nextPagination
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.nextValuesForPagination());

    this.store.select(NoteStore.getIsCanceled)
      .subscribe(x => {
        if (x === true) {
          // this.notes = this.allNotes.slice(0, 30);
          // this.store.dispatch(new CancelAllSelectedLabels(false));
        }
      });
  }

  ngOnDestroy(): void {
    console.log('note destroy');
    this.destroy.next();
    this.destroy.complete();
    this.labelsIds.unsubscribe();
  }

  nextValuesForPagination() {
    console.log('Notes');
    console.log(this.notes.length);
    console.log(this.pagService.countNextNotes);
    const nextNotes = this.allNotes.slice(this.notes.length, this.notes.length + this.pagService.countNextNotes);
    this.addToDomAppend(nextNotes);
  }


  firstInit(notes: SmallNote[]) {
    console.log('first init start');
    this.allNotes = [...notes].map(note => { note = { ...note }; return note; });
    if (!this.isFiltedMode()) {
    this.notes = this.allNotes.slice(0, 30);
    this.pagService.newPage();
    } else {
      const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
      this.notes = this.allNotes.filter(x => x.labels.some(label => ids.some(z => z === label.id)));
    }
    console.log('first init end');
    this.labelsIds = this.store.select(NoteStore.getSelectedLabelFilter).subscribe(async (x) => await this.UpdateLabelSelected(x));
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
    if (ids.length !== 0) {
      // await this.store.dispatch(new SpinnerChangeStatus(true)).toPromise();
      // this.murriService.grid.destroy();
      // this.notes = this.allNotes.filter(x => x.labels.some(label => ids.some(z => z === label.id)));
      // await this.store.dispatch(new SpinnerChangeStatus(false)).toPromise();
      // await this.murriService.initMurriNoteAsync(this.store.selectSnapshot(AppStore.getTypeNote));
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
