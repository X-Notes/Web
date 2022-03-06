import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { map } from 'rxjs/operators';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { Observable } from 'rxjs';
import { SmallFolder } from './models/folder.model';
import { Folders } from './models/folders.model';
import { RequestFullFolder } from './models/request-full-folder.model';
import { InvitedUsersToNoteOrFolder } from '../notes/models/invited-users-to-note.model';
import { BottomFolderContent } from './models/bottom-folder-content.model';

@Injectable()
export class ApiFoldersService {
  constructor(private httpClient: HttpClient) {}

  getFolders(type: FolderTypeENUM, settings: PersonalizationSetting) {
    let params = new HttpParams();
    if (settings) {
      Object.keys(settings).forEach((key) => {
        params = params.append(key, settings[key]);
      });
    }

    return this.httpClient
      .get<SmallFolder[]>(`${environment.writeAPI}/api/folder/type/${type}`, { params })
      .pipe(map((folders) => new Folders(type, folders)));
  }

  getUsersOnPrivateFolder(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(
      `${environment.writeAPI}/api/share/folders/user/invites/${id}`,
    );
  }

  getFoldersMany(folderIds: string[], settings: PersonalizationSetting): Observable<SmallFolder[]> {
    const obj = {
      folderIds,
      settings,
    };
    return this.httpClient
      .post<OperationResult<SmallFolder[]>>(`${environment.writeAPI}/api/folder/many`, obj)
      .pipe(
        map((z) => {
          if (z.success) {
            return z.data;
          }
          return [];
        }),
      );
  }

  changeUserPermission(folderId: string, userId: string, accessTypeId: RefTypeENUM) {
    const obj = {
      folderId,
      userId,
      accessTypeId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/folders/user/permission`,
      obj,
    );
  }

  sendInvitesToFolder(
    userIds: string[],
    folderId: string,
    refTypeId: RefTypeENUM,
    sendMessage: boolean,
    message: string,
  ) {
    const obj = {
      userIds,
      folderId,
      refTypeId,
      sendMessage,
      message,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/folders/user/invites`, obj);
  }

  removeUserFromPrivateFolder(folderId: string, userId: string) {
    const obj = {
      folderId,
      userId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/folders/user/remove`,
      obj,
    );
  }

  get(id: string) {
    return this.httpClient.get<RequestFullFolder>(`${environment.writeAPI}/api/folder/${id}`);
  }

  new() {
    return this.httpClient.get<SmallFolder>(`${environment.writeAPI}/api/folder/new`);
  }

  archive(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/folder/archive`,
      obj,
    );
  }

  setDelete(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/folder/delete`,
      obj,
    );
  }

  deleteFolders(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/folder/delete/permanently`, obj);
  }

  copyFolders(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<SmallFolder[]>(`${environment.writeAPI}/api/folder/copy`, obj);
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/folder/color`,
      obj,
    );
  }

  makePrivate(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/folder/ref/private`,
      obj,
    );
  }

  makePublic(refTypeId: RefTypeENUM, ids: string[]) {
    const obj = {
      refTypeId,
      ids,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/folders/share`,
      obj,
    );
  }

  // FULL FOLDER

  updateTitle(title: string, id: string) {
    const obj = {
      title,
      id,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/fullfolder/title`,
      obj,
    );
  }

  getAdditionalInfos(folderIds: string[]) {
    const obj = {
      folderIds,
    };
    return this.httpClient.post<BottomFolderContent[]>(
      `${environment.writeAPI}/api/folder/additional`,
      obj,
    );
  }
}
