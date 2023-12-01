import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { environment } from 'src/environments/environment';
import { NoteHistory } from '../models/history/note-history.model';
import { NoteSnapshotState } from '../models/history/note-snapshot-state.model';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';

@Injectable()
export class ApiNoteHistoryService {
  constructor(private httpClient: HttpClient) {}

  getHistory(noteId: string) {
    return this.httpClient.get<OperationResult<NoteHistory[]>>(
      `${environment.api}/api/history/${noteId}`,
    );
  }

  getSnapshot(noteId: string, snapshotId: string) {
    return this.httpClient.get<OperationResult<NoteSnapshotState>>(
      `${environment.api}/api/history/snapshot/${noteId}/${snapshotId}`,
    );
  }

  getSnapshotContent(noteId: string, snapshotId: string) {
    return this.httpClient
      .get<OperationResult<ContentModelBase[]>>(
        `${environment.api}/api/history/snapshot/contents/${noteId}/${snapshotId}`,
      )
      .pipe(map((x) => (x.success ? TransformNoteUtil.transformContent(x.data) : [])));
  }
}
