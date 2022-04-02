import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';

@Injectable()
export class ApiFullFolderService {
  controllerApi = `${environment.writeAPI}/api/fullfolder`;

  constructor(private httpClient: HttpClient) {}

  getFolderNotes(folderId: string, settings: PersonalizationSetting) {
    let params = new HttpParams();
    if (settings) {
      Object.keys(settings).forEach((key) => {
        params = params.append(key, settings[key]);
      });
    }
    return this.httpClient
      .get<SmallNote[]>(`${this.controllerApi}/${folderId}`, { params })
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  getAllPreviewNotes(folderId: string, search: string, settings: PersonalizationSetting) {
    const obj = {
      folderId,
      search,
      settings,
    };
    return this.httpClient
      .post<SmallNote[]>(`${this.controllerApi}/preview`, obj)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  addNotesToFolder(noteIds: string[], folderId: string) {
    const obj = {
      noteIds,
      folderId,
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/add/notes`, obj);
  }

  removeNotesFromFolder(noteIds: string[], folderId: string) {
    const obj = {
      noteIds,
      folderId,
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/remove/notes`, obj);
  }

  orderNotesInFolder(positions: PositionEntityModel[], folderId: string) {
    // TODO
    const obj = {
      positions,
      folderId,
    };
    return this.httpClient.patch<OperationResult<any>>(`${this.controllerApi}/order/notes`, obj);
  }
}
