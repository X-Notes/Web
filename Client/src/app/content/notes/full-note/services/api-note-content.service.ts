import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { StructureDiffs } from '../content-editor-services/models/structure-diffs';
import { NoteStructureResult } from '../models/api/notes/note-structure-result';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UpdateCursor } from '../models/cursors/cursor';
import { UpdateNoteStructureWS } from 'src/app/core/models/signal-r/innerNote/update-note-structure-ws';

@Injectable({
  providedIn: 'root',
})
export class ApiNoteContentService {
  constructor(private httpClient: HttpClient) {}

  syncContentsStructure(noteId: string, diffs: StructureDiffs) {
    const obj = {
      diffs,
      noteId,
    };
    return this.httpClient.patch<OperationResult<NoteStructureResult>>(
      `${environment.writeAPI}/api/note/inner/contents/sync/structure`,
      obj,
    ).pipe(map(x => {
      if(x.success && x.data) {
        x.data.updates = new UpdateNoteStructureWS(x.data.updates);
      }
      return x;
    }));
  }

  getContents(noteId: string, folderId: string = null): Observable<ContentModelBase[]> {
    let params = new HttpParams();
    if (folderId) {
      params = params.append('folderId', folderId);
    }
    return this.httpClient
      .get<OperationResult<ContentModelBase[]>>(
        `${environment.writeAPI}/api/note/inner/contents/${noteId}`,
        {
          params,
        },
      )
      .pipe(
        map((x) => {
          if (x.success) {
            return TransformNoteUtil.transformContent(x.data);
          }
          return [];
        }),
      );
  }

  updateCursorPosition(noteId: string, cursor: UpdateCursor) {
    const obj = {
      cursor,
      noteId,
    };
    return this.httpClient.post<OperationResult<void>>(
      `${environment.writeAPI}/api/note/inner/contents/cursor`,
      obj,
    );
  }
}
