import { Injectable } from '@angular/core';
import { UpdateColor } from './state/updateColor';
import { SmallNote } from './models/smallNote';
import { FullNote } from './models/fullNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { NoteStore } from './state/notes-state';

@Injectable()
export class NotesService {

  notes: SmallNote[] = [];
  constructor(public pService: PersonalizationService, private store: Store) {

    this.store.select(NoteStore.updateColorEvent)
    .subscribe(x => this.changeColorHandler(x));

    this.store.select(NoteStore.removeFromMurriEvent)
    .subscribe(x => this.delete(x));
  }

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      this.notes.find(x => x.id === update.id).color = update.color;
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
      setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
    }
  }


  addToDom(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [...notes.map(note => { note = { ...note }; return note; }).reverse() , ...this.notes];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i++) {
          const el = DOMnodes[i];
          this.pService.grid.add(el, {index : 0, layout: true});
        }
      }, 0);
    }
  }

}
