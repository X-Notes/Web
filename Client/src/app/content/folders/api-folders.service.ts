import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SmallFolder } from './models/folder';
import { environment } from 'src/environments/environment';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { map } from 'rxjs/operators';
import { Folders } from './models/Folders';
import { RequestFullFolder } from './models/requestFullFolder';
import { InvitedUsersToNoteOrFolder } from '../notes/models/invitedUsersToNote';
import { EntityRef } from 'src/app/shared/models/entityRef';

@Injectable()
export class ApiFoldersService {

  constructor(private httpClient: HttpClient) { }

  getFolders(id: string, type: FolderTypeENUM) {
    return this.httpClient.get<SmallFolder[]>(environment.writeAPI + `/api/folder/type/${id}`)
      .pipe(map(folders => new Folders(type, folders)));
  }


  getUsersOnPrivateFolder(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(environment.writeAPI + `/api/share/folders/user/invites/${id}`);
  }

  changeUserPermission(folderId: string, userId: string, accessTypeId: string) {
    const obj = {
      folderId,
      userId,
      accessTypeId
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/folders/user/permission`, obj);
  }

  sendInvitesToFolder(userIds: string[], folderId: string, refTypeId: string, sendMessage: boolean, message: string) {
    const obj = {
      userIds,
      folderId,
      refTypeId,
      sendMessage,
      message
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/folders/user/invites`, obj);
  }

  removeUserFromPrivateFolder(folderId: string, userId: string) {
    const obj = {
      folderId,
      userId
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/folders/user/remove`, obj);
  }

  get(id: string) {
    return this.httpClient.get<RequestFullFolder>(environment.writeAPI + `/api/folder/${id}`);
  }

  new() {
    return this.httpClient.get<SmallFolder>(environment.writeAPI + `/api/folder/new`);
  }

  archiveFolder(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(environment.writeAPI + `/api/folder/archive`, obj);
  }

  setDeleteFolder(ids: string[]) {
    const obj = {
      ids
    };
    return this.httpClient.patch(environment.writeAPI + `/api/folder/delete`, obj);
  }

  deleteFolders(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(environment.writeAPI + `/api/folder/delete/permanently`, obj);
  }

  copyFolders(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<SmallFolder[]>(environment.writeAPI + `/api/folder/copy`, obj);
  }

  restoreFolder(ids: string[]) {
    const obj = {
      ids
    };
    return this.httpClient.patch(environment.writeAPI + `/api/folder/restore`, obj);
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color
    };
    return this.httpClient.patch(environment.writeAPI + `/api/folder/color`, obj);
  }

  makePrivateFolders(ids: string[]) {
    const obj = {
      ids
    };
    return this.httpClient.patch(environment.writeAPI + `/api/folder/ref/private`, obj);
  }

  makePublic(refType: EntityRef, id: string) {
    const obj = {
      refTypeId: refType.id,
      id
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/folders/share`, obj);
  }

  // FULL FOLDER

  updateTitle(title: string, id: string) {
    const obj = {
      title,
      id
    };
    return this.httpClient.patch(environment.writeAPI + `/api/fullfolder/title`, obj);
  }

}
