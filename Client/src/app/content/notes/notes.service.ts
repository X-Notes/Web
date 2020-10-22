import { ElementRef, Injectable, OnDestroy, ViewChild } from '@angular/core';
import { UpdateColor } from './state/updateColor';
import { SmallNote } from './models/smallNote';
import { FullNote } from './models/fullNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { NoteStore } from './state/notes-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PaginationService } from 'src/app/shared/services/pagination.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class NotesService implements OnDestroy {

  destroy  = new Subject<void>();
  allNotes: SmallNote[] = [];
  notes: SmallNote[] = [];
  constructor(public pService: PersonalizationService, private store: Store,
              private murriService: MurriService,
              private pagService: PaginationService) {

    this.store.select(NoteStore.updateColorEvent)
    .subscribe(x => this.changeColorHandler(x));

    this.store.select(NoteStore.removeFromMurriEvent)
    .subscribe(x => this.delete(x));

    this.pagService.nextPagination
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.nextValuesForPagination());
  }

  ngOnDestroy(): void {
    console.log('note destroy');
    this.destroy.next();
    this.destroy.complete();
  }

  nextValuesForPagination() {
    console.log('Notes');
    console.log(this.notes.length);
    console.log(this.pagService.countNextNotes);
    const nextNotes = this.allNotes.slice(this.notes.length, this.notes.length + this.pagService.countNextNotes);
    this.addToDomAppend(nextNotes);
  }

  firstInit(notes: SmallNote[]) {
    this.allNotes = [...notes].map(note => { note = {...note}; return note; });
    this.notes = this.allNotes.slice(0, 30);
    this.pagService.newPage();
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

  delete(ids: string[]) {
    if (ids.length > 0) {
      this.notes = this.notes.filter(x => !ids.some(z => z === x.id));
      setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
    }
  }


  addToDom(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [...notes.map(note => { note = { ...note }; return note; }).reverse() , ...this.notes];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, {index: 0, layout: true});
        }
      }, 0);
    }
  }

  addToDomAppend(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [...notes.map(note => { note = { ...note }; return note; }) , ...this.notes];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, {index: -1, layout: true});
        }
      }, 0);
    }
  }

}
