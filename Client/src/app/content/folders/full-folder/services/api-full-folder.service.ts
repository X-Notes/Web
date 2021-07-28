import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreviewNote } from 'src/app/content/notes/models/preview-note.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { OperationResult } from 'src/app/content/notes/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';

@Injectable()
export class ApiFullFolderService {
  controllerApi = `${environment.writeAPI}/api/fullfolder`;

  constructor(private httpClient: HttpClient) {}

  getFolderNotes(folderId: string) {
    return this.httpClient
      .get<SmallNote[]>(`${this.controllerApi}/${folderId}`)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  getAllPreviewNotes(folderId: string, search: string, settings: PersonalizationSetting) {
    const obj = {
      folderId,
      search,
      settings,
    };
    return this.httpClient
      .post<PreviewNote[]>(`${this.controllerApi}/preview`, obj)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  updateNotesInFolder(noteIds: string[], folderId: string) {
    const obj = {
      noteIds,
      folderId,
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/update/notes`, obj);
  }

  removeNotesInFolder(noteIds: string[], folderId: string) {
    const obj = {
      noteIds,
      folderId,
    };
    return this.httpClient.post<OperationResult<any>>(`${this.controllerApi}/remove/notes`, obj);
  }
}
