import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { RelatedNote } from './models/related-note.model';
import { OperationResult } from '../../shared/models/operation-result.model';
import { PositionEntityModel } from './models/position-note.model';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { Observable } from 'rxjs';
import { SmallNote } from './models/small-note.model';

@Injectable()
export class ApiRelatedNotesService {
  constructor(private httpClient: HttpClient) {}

  updateRelatedNotes(
    noteId: string,
    relatedNoteIds: string[],
  ): Observable<OperationResult<UpdateRelatedNotesWS>> {
    const obj = {
      noteId,
      relatedNoteIds,
    };
    return this.httpClient.post<OperationResult<UpdateRelatedNotesWS>>(
      `${environment.writeAPI}/api/relatedNotes`,
      obj,
    );
  }

  getRelatedNotes(noteId: string) {
    return this.httpClient
      .get<RelatedNote[]>(`${environment.writeAPI}/api/relatedNotes/${noteId}`)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  getAllPreviewNotes(noteId: string, search: string, settings: PersonalizationSetting) {
    const obj = {
      noteId,
      search,
      settings,
    };
    return this.httpClient
      .post<SmallNote[]>(`${environment.writeAPI}/api/relatedNotes/preview`, obj)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  updateState(noteId: string, reletatedNoteInnerNoteId: number, isOpened: boolean) {
    const obj = {
      noteId,
      reletatedNoteInnerNoteId,
      isOpened,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/relatedNotes/state`,
      obj,
    );
  }

  updateOrder(noteId: string, positions: PositionEntityModel[]) {
    const obj = {
      positions,
      noteId,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/relatedNotes/order`,
      obj,
    );
  }
}
