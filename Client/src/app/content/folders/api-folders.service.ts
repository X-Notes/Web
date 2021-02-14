import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Folder } from './models/folder';
import { environment } from 'src/environments/environment';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { map } from 'rxjs/operators';
import { Folders } from './models/Folders';
import { RequestFullFolder } from './models/requestFullFolder';
import { RefType } from 'src/app/core/models/refType';
import { InvitedUsersToNoteOrFolder } from '../notes/models/invitedUsersToNote';

@Injectable()
export class ApiFoldersService {

  constructor(private httpClient: HttpClient) { }

  getPrivateFolders() {
    return this.httpClient.get<Folder[]>(environment.writeAPI + '/api/folder/private')
                          .pipe(map(z => {
                            z.forEach(note => note.folderType = FolderType.Private);
                            return new Folders(FolderType.Private, z);
                          }));
  }

  getSharedFolders() {
    return this.httpClient.get<Folder[]>(environment.writeAPI + '/api/folder/shared')
                          .pipe(map(z => {
                            z.forEach(note => note.folderType = FolderType.Shared);
                            return new Folders(FolderType.Shared, z);
                          }));
  }

  getDeletedFolders() {
    return this.httpClient.get<Folder[]>(environment.writeAPI + '/api/folder/deleted')
                          .pipe(map(z => {
                            z.forEach(note => note.folderType = FolderType.Deleted);
                            return new Folders(FolderType.Deleted, z);
                          }));
  }

  getArchiveFolders() {
    return this.httpClient.get<Folder[]>(environment.writeAPI + '/api/folder/archive')
                          .pipe(map(z => {
                            z.forEach(note => note.folderType = FolderType.Archive);
                            return new Folders(FolderType.Archive, z);
                          }));
  }

  getUsersOnPrivateFolder(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(environment.writeAPI + `/api/share/folders/user/invites/${id}`);
  }

  changeUserPermission(folderId: string, userId: string, accessType: RefType) {
    const obj = {
      folderId,
      userId,
      accessType
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/folders/user/permission`, obj);
  }

  sendInvitesToFolder(userIds: string[], folderId: string, refType: RefType, sendMessage: boolean, message: string) {
    const obj = {
      userIds,
      folderId,
      refType,
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
    return this.httpClient.get<string>(environment.writeAPI + `/api/folder/new`);
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
    return this.httpClient.patch<Folder[]>(environment.writeAPI + `/api/folder/copy`, obj);
  }

  restoreFolder(ids: string[]) {
    const obj = {
      ids,
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

  makePublic(refType: RefType, id: string) {
    const obj = {
      refType,
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
