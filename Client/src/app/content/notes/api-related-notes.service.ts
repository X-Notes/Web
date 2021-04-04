import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SmallNote } from './models/smallNote';

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
    return this.httpClient.get<SmallNote[]>(`${environment.writeAPI}/api/relatedNotes/${noteId}`);
  }
}
