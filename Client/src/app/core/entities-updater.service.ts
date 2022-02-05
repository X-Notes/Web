import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';

@Injectable()
export class UpdaterEntitiesService {
  notesIds$ = new BehaviorSubject<string[]>([]);

  foldersIds$ = new BehaviorSubject<string[]>([]);

  updateNotesInFolder$ = new BehaviorSubject<UpdateNoteUI[]>([]);
}
