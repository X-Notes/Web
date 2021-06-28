import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PreviewNote } from './models/preview-note.model';
import { RelatedNote } from './models/related-note.model';
import { OperationResult } from './models/operation-result.model';

@Injectable()
export class ApiRelatedNotesService {
  constructor(private httpClient: HttpClient) {}

  addToRelatedNotesNotes(noteId: string, relatedNoteIds: string[]) {
    const obj = {
      noteId,
      relatedNoteIds,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/relatedNotes`,
      obj,
    );
  }

  getRelatedNotes(noteId: string) {
    return this.httpClient.get<RelatedNote[]>(`${environment.writeAPI}/api/relatedNotes/${noteId}`);
  }

  getAllPreviewNotes(noteId: string, search: string) {
    const obj = {
      noteId,
      search,
    };
    return this.httpClient.post<PreviewNote[]>(
      `${environment.writeAPI}/api/relatedNotes/preview`,
      obj,
    );
  }

  updateState(noteId: string, relatedNoteId: string, isOpened: boolean) {
    const obj = {
      noteId,
      relatedNoteId,
      isOpened,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/relatedNotes/state`,
      obj,
    );
  }

  updateOrder(noteId: string, id: string, insertAfter: string) {
    const obj = {
      insertAfter,
      id,
      noteId,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/relatedNotes/order`,
      obj,
    );
  }
}
