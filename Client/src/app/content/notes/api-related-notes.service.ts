import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { EntityMapperUtil } from 'src/app/shared/services/entity-mapper.util';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { PreviewNote } from './models/preview-note.model';
import { RelatedNote } from './models/related-note.model';
import { OperationResult } from '../../shared/models/operation-result.model';
import { PositionEntityModel } from './models/position-note.model';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { Observable } from 'rxjs';

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
      .pipe(map((z) => EntityMapperUtil.transformNotes(z)));
  }

  getAllPreviewNotes(noteId: string, search: string, settings: PersonalizationSetting) {
    const obj = {
      noteId,
      search,
      settings,
    };
    return this.httpClient
      .post<PreviewNote[]>(`${environment.writeAPI}/api/relatedNotes/preview`, obj)
      .pipe(map((z) => EntityMapperUtil.transformNotes(z)));
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
