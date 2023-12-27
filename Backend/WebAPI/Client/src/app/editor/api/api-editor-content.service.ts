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
import { ContentState } from '../entities/state/content-state';
import { EditorStateResult } from '../entities/state/editor-state-result';
import { TextDiff } from '../entities/text/text-diff';
import { TextUpdateResult } from '../entities/text/text-update-result';
import { VersionUpdateResult } from 'src/app/core/models/entity/version-update-result';

@Injectable({
  providedIn: 'root',
})
export class ApiNoteEditorService {
  constructor(private httpClient: HttpClient) {}

  updateTitle(title: string, id: string, connectionId: string) {
    const obj = {
      title,
      id,
      connectionId
    };
    return this.httpClient.patch<OperationResult<VersionUpdateResult>>(
      `${environment.api}/api/editor/text/title`,
      obj,
    );
  }

  syncContents(noteId: string, texts: TextDiff[], connectionId: string) {
    const obj = {
      noteId,
      texts,
      connectionId
    };
    return this.httpClient.patch<OperationResult<TextUpdateResult[]>>(
      `${environment.api}/api/editor/text/sync`,
      obj,
    );
  }
  
  syncContentsStructure(noteId: string, diffs: EditorStructureDiffs, connectionId: string) {
    const obj = {
      diffs,
      noteId,
      connectionId
    };
    return this.httpClient.patch<OperationResult<EditorStructureResult>>(
      `${environment.api}/api/editor/contents/sync/structure`,
      obj,
    ).pipe(map(x => {
      if(x.success && x.data) {
        x.data.updates = new UpdateEditorStructureWS(x.data.updates);
      }
      return x;
    }));
  }

  syncEditorState(noteId: string, syncState: ContentState[], folderId?: string) {
    const obj = {
      syncState,
      noteId,
      folderId
    };
    return this.httpClient.patch<OperationResult<EditorStateResult>>(
      `${environment.api}/api/editor/contents/sync/state`,
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
        `${environment.api}/api/editor/contents/${noteId}`,
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

  updateCursorPosition(noteId: string, cursor: UpdateCursor, connectionId: string) {
    const obj = {
      cursor,
      noteId,
      connectionId
    };
    return this.httpClient.post<OperationResult<void>>(
      `${environment.api}/api/editor/contents/cursor`,
      obj,
    );
  }
}
