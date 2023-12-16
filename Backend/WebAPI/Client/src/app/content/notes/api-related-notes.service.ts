import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { RelatedNote } from './models/related-note.model';
import { OperationResult } from '../../shared/models/operation-result.model';
import { PositionEntityModel } from './models/position-note.model';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { Observable } from 'rxjs';
import { PreviewNote } from './models/preview-note.model';

@Injectable()
export class ApiRelatedNotesService {
  constructor(private httpClient: HttpClient) {}

  updateRelatedNotes(
    noteId: string,
    relatedNoteIds: string[], 
    connectionId: string
  ): Observable<OperationResult<UpdateRelatedNotesWS>> {
    const obj = {
      noteId,
      relatedNoteIds,
      connectionId
    };
    return this.httpClient.post<OperationResult<UpdateRelatedNotesWS>>(
      `${environment.api}/api/relatedNotes`,
      obj,
    );
  }

  getRelatedNotes(noteId: string) {
    return this.httpClient
      .get<RelatedNote[]>(`${environment.api}/api/relatedNotes/${noteId}`)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  getAllPreviewNotes(noteId: string, search: string, takeContents: number) {
    const obj = {
      noteId,
      search,
      takeContents,
    };
    return this.httpClient
      .post<PreviewNote[]>(`${environment.api}/api/relatedNotes/preview`, obj)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  updateState(noteId: string, reletatedNoteInnerNoteId: number, isOpened: boolean) {
    const obj = {
      noteId,
      reletatedNoteInnerNoteId,
      isOpened,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/relatedNotes/state`,
      obj,
    );
  }

  updateOrder(noteId: string, positions: PositionEntityModel[], connectionId: string) {
    const obj = {
      positions,
      noteId,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/relatedNotes/order`,
      obj,
    );
  }
}
