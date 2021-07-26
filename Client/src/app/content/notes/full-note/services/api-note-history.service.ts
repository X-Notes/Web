import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { environment } from 'src/environments/environment';
import { ContentModel } from '../../models/content-model.model';
import { NoteHistory } from '../models/history/note-history.model';
import { NoteSnapshotState } from '../models/history/note-snapshot-state.model';

@Injectable()
export class ApiNoteHistoryService {
  constructor(private httpClient: HttpClient) {}

  getHistory(noteId: string) {
    return this.httpClient.get<NoteHistory[]>(`${environment.writeAPI}/api/history/${noteId}`);
  }

  getSnapshot(noteId: string, snapshotId: string) {
    return this.httpClient.get<NoteSnapshotState>(
      `${environment.writeAPI}/api/history/snapshot/${noteId}/${snapshotId}`,
    );
  }

  getSnapshotContent(noteId: string, snapshotId: string) {
    return this.httpClient
      .get<ContentModel[]>(
        `${environment.writeAPI}/api/history/snapshot/contents/${noteId}/${snapshotId}`,
      )
      .pipe(map((x) => TransformNoteUtil.transformContent(x)));
  }
}
