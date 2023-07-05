import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { finalize, map, takeUntil } from 'rxjs/operators';
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
import { CopyFoldersResult } from './models/copy-folders-result';
import { OperationDetailMini, LongTermOperation } from '../long-term-operations-handler/models/long-term-operation';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';

@Injectable()
export class ApiFoldersService {
  constructor(
    private httpClient: HttpClient,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,) { }

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
        map((q) => {
          if (q.success) {
            return q.data;
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

  sendInvitesToFolder(userIds: string[], folderId: string, refTypeId: RefTypeENUM) {
    const obj = {
      userIds,
      folderId,
      refTypeId,
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

  copyFolders(
    ids: string[],
    mini: OperationDetailMini,
    operation: LongTermOperation) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<CopyFoldersResult>>(
      `${environment.writeAPI}/api/folder/copy`,
      obj, {
      reportProgress: true,
      observe: 'events',
    }
    ).pipe(
      finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
      takeUntil(mini.obs),
      (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
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
