import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { SmallNote } from '../content/notes/models/small-note.model';
import {
  UpdateOneNote,
  ChangeIsLockedFullNote,
  PatchUpdatesUINotes,
} from '../content/notes/state/notes-actions';
import { NoteStore } from '../content/notes/state/notes-state';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';

@Injectable()
export class UpdaterEntitiesService {
  notesIds$ = new BehaviorSubject<string[]>([]);

  foldersIds$ = new BehaviorSubject<string[]>([]);

  updateNotesInFolder$ = new BehaviorSubject<UpdateNoteUI[]>([]);

  unlockNotesState: { [noteId: string]: NodeJS.Timeout } = {};

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

  async setLockedInState(noteid: string, isLocked?: boolean, isLockedNow?: boolean) {
    const updatedNote = { ...this.getNote(noteid) };
    updatedNote.isLocked = isLocked ?? updatedNote.isLocked;
    updatedNote.isLockedNow = isLockedNow ?? updatedNote.isLockedNow;
    updatedNote.unlockedTime = !isLockedNow ? new Date() : null;
    await this.store.dispatch(new UpdateOneNote(updatedNote)).toPromise();
    this.store.dispatch(new ChangeIsLockedFullNote(isLocked, isLockedNow));
    //
    const obj = new UpdateNoteUI(noteid);
    obj.isLocked = updatedNote.isLocked;
    obj.isLockedNow = updatedNote.isLockedNow;
    obj.unlockedTime = updatedNote.unlockedTime;
    this.store.dispatch(new PatchUpdatesUINotes([obj]));
  }

  lockNoteAfter(noteId: string, minutes: number = 5) {
    const date = this.getNote(noteId)?.unlockedTime;
    if (!date) return;
    const time = new Date(date).getTime() + minutes * 60000;
    const now = new Date().getTime();
    const diff = time - now;
    this.clearLock(noteId);
    if (!diff) return;
    this.unlockNotesState[noteId] = setTimeout(async () => {
      await this.setLockedInState(noteId, true, true);
    }, diff);
  }

  clearLock(noteId: string) {
    if (noteId && this.unlockNotesState[noteId]) {
      clearTimeout(this.unlockNotesState[noteId]);
    }
  }
}
