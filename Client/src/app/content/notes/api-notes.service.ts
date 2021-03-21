import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { EntityRef } from 'src/app/shared/models/entityRef';
import { SmallNote } from './models/smallNote';
import { RequestFullNote } from './models/requestFullNote';
import { Notes } from './state/Notes';
import { InvitedUsersToNoteOrFolder } from './models/invitedUsersToNote';
import { Album, BaseText, ContentModel } from './models/ContentMode';
import { TextOperationResult } from './models/TextOperationResult';

@Injectable()
export class ApiServiceNotes {
  constructor(private httpClient: HttpClient) {}

  getNotes(id: string, type: NoteTypeENUM) {
    return this.httpClient
      .get<SmallNote[]>(`${environment.writeAPI}/api/note/type/${id}`)
      .pipe(map((notes) => new Notes(type, notes)));
  }

  addLabel(labelId: string, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/label/add`, obj);
  }

  removeLabel(labelId: string, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/label/remove`, obj);
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/color`, obj);
  }

  setDeleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/delete`, obj);
  }

  makePrivateNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/ref/private`, obj);
  }

  copyNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<SmallNote[]>(`${environment.writeAPI}/api/note/copy`, obj);
  }

  deleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/delete/permanently`, obj);
  }

  archiveNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/archive`, obj);
  }

  get(id: string) {
    return this.httpClient.get<RequestFullNote>(`${environment.writeAPI}/api/note/${id}`);
  }

  getAll() {
    return this.httpClient.get<SmallNote[]>(`${environment.writeAPI}/api/note/all`);
  }

  new() {
    return this.httpClient.get<SmallNote>(`${environment.writeAPI}/api/note/new`);
  }

  getUsersOnPrivateNote(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(
      `${environment.writeAPI}/api/share/notes/user/invites/${id}`,
    );
  }

  makePublic(refType: EntityRef, id: string) {
    const obj = {
      refTypeId: refType.id,
      id,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/share`, obj);
  }

  sendInvitesToNote(
    userIds: string[],
    noteId: string,
    refTypeId: string,
    sendMessage: boolean,
    message: string,
  ) {
    const obj = {
      userIds,
      noteId,
      refTypeId,
      sendMessage,
      message,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/user/invites`, obj);
  }

  removeUserFromPrivateNote(noteId: string, userId: string) {
    const obj = {
      noteId,
      userId,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/user/remove`, obj);
  }

  changeUserPermission(noteId: string, userId: string, accessTypeId: string) {
    const obj = {
      noteId,
      userId,
      accessTypeId,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/user/permission`, obj);
  }
  // FULL NOTE

  updateTitle(title: string, id: string) {
    const obj = {
      title,
      id,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/fullnote/title`, obj);
  }

  newLine(noteId: string) {
    const obj = {
      noteId,
    };
    return this.httpClient.post<TextOperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/new`,
      obj,
    );
  }

  insertLine(noteId: string, contentId: string, lineBreakType: string, nextText?: string) {
    const obj = {
      noteId,
      contentId,
      lineBreakType,
      nextText,
    };
    return this.httpClient.post<TextOperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/insert`,
      obj,
    );
  }

  removeContent(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<TextOperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/content/remove`,
      obj,
    );
  }

  updateContentText(noteId: string, contentId: string, content: string, checked: boolean) {
    const obj = {
      contentId,
      content,
      noteId,
      checked,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/fullnote/text`, obj);
  }

  concatWithPrevious(noteId: string, contentId: string) {
    const obj = {
      contentId,
      noteId,
    };
    return this.httpClient.post<TextOperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/concat`,
      obj,
    );
  }

  updateContentType(noteId: string, contentId: string, type: string, headingType: string) {
    const obj = {
      contentId,
      type,
      noteId,
      headingType,
    };
    return this.httpClient.patch<TextOperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/text/type`,
      obj,
    );
  }

  getContents(noteId: string) {
    return this.httpClient.get<ContentModel[]>(
      `${environment.writeAPI}/api/fullnote/contents/${noteId}`,
    );
  }

  // ALBUMS

  insertAlbumToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<TextOperationResult<Album>>(
      `${environment.writeAPI}/api/fullnote/album/${id}/${contentId}`,
      data,
    );
  }

  removeAlbum(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<TextOperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/remove`,
      obj,
    );
  }

  uploadPhotosToAlbum(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<TextOperationResult<string[]>>(
      `${environment.writeAPI}/api/fullnote/album/upload/${id}/${contentId}`,
      data,
    );
  }

  removePhotoFromAlbum(noteId: string, contentId: string, photoId: string) {
    return this.httpClient.delete<TextOperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/photo/${noteId}/${contentId}/${photoId}`,
    );
  }

  updateCountInRow(noteId: string, contentId: string, count: number) {
    const obj = {
      noteId,
      contentId,
      count,
    };
    return this.httpClient.patch<TextOperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/row/count`,
      obj,
    );
  }

  updateAlbumSize(noteId: string, contentId: string, width: string, height: string) {
    const obj = {
      noteId,
      contentId,
      width,
      height,
    };
    return this.httpClient.patch<TextOperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/size`,
      obj,
    );
  }
}
