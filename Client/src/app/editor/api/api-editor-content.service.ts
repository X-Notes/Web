import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { UpdateCursor } from '../entities/cursors/cursor';
import { EditorStructureResult } from '../entities/structure/editor-structure-result';
import { EditorStructureDiffs } from '../entities/structure/editor-structure-diffs';
import { UpdateEditorStructureWS } from '../entities/ws/update-note-structure-ws';
import { EditorStateDiffs } from '../entities/state/editor-state-diffs';
import { EditorStateResult } from '../entities/state/editor-state-result';

@Injectable({
  providedIn: 'root',
})
export class ApiNoteContentService {
  constructor(private httpClient: HttpClient) {}

  syncContentsStructure(noteId: string, diffs: EditorStructureDiffs) {
    const obj = {
      diffs,
      noteId,
    };
    return this.httpClient.patch<OperationResult<EditorStructureResult>>(
      `${environment.writeAPI}/api/editor/contents/sync/structure`,
      obj,
    ).pipe(map(x => {
      if(x.success && x.data) {
        x.data.updates = new UpdateEditorStructureWS(x.data.updates);
      }
      return x;
    }));
  }

  syncEditorState(noteId: string, syncState: EditorStateDiffs[], folderId?: string) {
    const obj = {
      syncState,
      noteId,
      folderId
    };
    return this.httpClient.patch<OperationResult<EditorStateResult>>(
      `${environment.writeAPI}/api/editor/contents/sync/state`,
      obj,
    ).pipe(map(x => {
      if(x.success && x.data) {
        x.data.contentsToAdd = TransformNoteUtil.transformContent(x.data.contentsToAdd);
        x.data.contentsToUpdate = TransformNoteUtil.transformContent(x.data.contentsToUpdate);
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
        `${environment.writeAPI}/api/editor/contents/${noteId}`,
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
      `${environment.writeAPI}/api/editor/contents/cursor`,
      obj,
    );
  }
}
