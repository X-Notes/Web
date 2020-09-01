import { Injectable } from '@angular/core';
import { UpdateColor } from './state/updateColor';
import { SmallNote } from './models/smallNote';
import { FullNote } from './models/fullNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Injectable()
export class NotesService {

  constructor(public pService: PersonalizationService) { }

  changeColorHandler(notes: SmallNote[], updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      notes.find(x => x.id === update.id).color = update.color;
    }
  }

  changeColorHandlerFullNote(note: FullNote, updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (note.id === update.id) {
        note.color = update.color;
      }
    }
  }


}
