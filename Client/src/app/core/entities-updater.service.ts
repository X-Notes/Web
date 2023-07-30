import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { SmallNote } from '../content/notes/models/small-note.model';
import { NoteStore } from '../content/notes/state/notes-state';
@Injectable()
export class UpdaterEntitiesService {
  notesIds$ = new BehaviorSubject<string[]>([]);

  foldersIds$ = new BehaviorSubject<string[]>([]);

  constructor(private store: Store) {}

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

  getNote(id: string): SmallNote {
    return this.store.selectSnapshot(NoteStore.getSmallNotes).find((x) => x.id === id);
  }
}
