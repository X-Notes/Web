import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';
import { SyncFolderResult } from '../../models/sync-folder-result';

@Injectable()
export class ApiFullFolderService {
  controllerApi = `${environment.api}/api/fullfolder`;

  constructor(private httpClient: HttpClient) {}

  syncFolderState(folderId: string, version: number, noteIds: string[]) {
    const obj = {
      folderId,
      version,
      noteIds
    };
    return this.httpClient.patch<OperationResult<SyncFolderResult>>(
      `${environment.api}/api/folder/sync/state`,
      obj,
    );
  }
  
  getFolderNotes(folderId: string, settings?: PersonalizationSetting, noteIds?: string[]) {
    const obj = {
      folderId,
      settings,
      noteIds,
    };
    return this.httpClient
      .post<SmallNote[]>(`${this.controllerApi}`, obj)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  getAllPreviewNotes(folderId: string, search: string, settings: PersonalizationSetting) {
    const obj = {
      folderId,
      search,
      settings,
    };
    return this.httpClient
      .post<SmallNote[]>(`${this.controllerApi}/preview`, obj)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  addNotesToFolder(noteIds: string[], folderId: string, connectionId: string) {
    const obj = {
      noteIds,
      folderId,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/add/notes`, obj);
  }

  removeNotesFromFolder(noteIds: string[], folderId: string, connectionId: string) {
    const obj = {
      noteIds,
      folderId,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/remove/notes`, obj);
  }

  orderNotesInFolder(positions: PositionEntityModel[], folderId: string, connectionId: string) {
    const obj = {
      positions,
      folderId,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/order/notes`, obj);
  }
}
