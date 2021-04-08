import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RelatedNote } from './models/relatedNote';

@Injectable()
export class ApiRelatedNotesService {
  constructor(private httpClient: HttpClient) {}

  addToRelatedNotesNotes(noteId: string, relatedNoteIds: string[]) {
    const obj = {
      noteId,
      relatedNoteIds,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/relatedNotes`, obj);
  }

  getRelatedNotes(noteId: string) {
    return this.httpClient.get<RelatedNote[]>(`${environment.writeAPI}/api/relatedNotes/${noteId}`);
  }

  updateState(noteId: string, relatedNoteId: string, isOpened: boolean) {
    const obj = {
      noteId,
      relatedNoteId,
      isOpened,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/relatedNotes/state`, obj);
  }
}
