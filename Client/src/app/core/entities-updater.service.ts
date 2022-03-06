import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';

@Injectable()
export class UpdaterEntitiesService {
  notesIds$ = new BehaviorSubject<string[]>([]);

  foldersIds$ = new BehaviorSubject<string[]>([]);

  updateNotesInFolder$ = new BehaviorSubject<UpdateNoteUI[]>([]);

  addNoteToUpdate(id: string): void {
    const prevValues = this.notesIds$.getValue();
    if (!prevValues.some((x) => x === id)) {
      this.notesIds$.next([...prevValues, id]);
    }
  }

  addFolderToUpdate(id: string): void {
    const prevValues = this.foldersIds$.getValue();
    if (!prevValues.some((x) => x === id)) {
      this.foldersIds$.next([...prevValues, id]);
    }
  }
}
