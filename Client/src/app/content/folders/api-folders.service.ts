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
import { InvitedUsersToNoteOrFolder } from '../notes/models/invited-users-to-note.model';
import { BottomFolderContent } from './models/bottom-folder-content.model';
import { PositionEntityModel } from '../notes/models/position-note.model';
import { FullFolder } from './models/full-folder.model';
import { MergeTransaction } from '../notes/full-note/content-editor/text/rga/types';

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

  clearAll(folderId: string) {
    const obj = {
      folderId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/folders/clear`,
      obj,
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

  changeUserPermission(folderId: string, permissionUserId: string, accessTypeId: RefTypeENUM) {
    const obj = {
      folderId,
      permissionUserId,
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

  removeUserFromPrivateFolder(folderId: string, permissionUserId: string) {
    const obj = {
      folderId,
      permissionUserId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/folders/user/remove`,
      obj,
    );
  }

  get(id: string): Observable<OperationResult<FullFolder>> {
    return this.httpClient.get<OperationResult<FullFolder>>(
      `${environment.writeAPI}/api/folder/${id}`,
    );
  }

  new(): Observable<OperationResult<SmallFolder>> {
    return this.httpClient.get<OperationResult<SmallFolder>>(
      `${environment.writeAPI}/api/folder/new`,
    );
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
    return this.httpClient.patch<OperationResult<string[]>>(
      `${environment.writeAPI}/api/folder/delete`,
      obj,
    );
  }

  deleteFolders(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/folder/delete/permanently`,
      obj,
    );
  }

  copyFolders(ids: string[]): Observable<OperationResult<SmallFolder[]>> {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<SmallFolder[]>>(
      `${environment.writeAPI}/api/folder/copy`,
      obj,
    );
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

  updateOrder(positions: PositionEntityModel[]) {
    const obj = {
      positions,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/folder/order`,
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

  updateTitle(transactions: MergeTransaction<string>[], id: string) {
    const obj = {
      transactions,
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
