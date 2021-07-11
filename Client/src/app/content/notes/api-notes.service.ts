import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { Observable } from 'rxjs';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { SmallNote } from './models/small-note.model';
import { RequestFullNote } from './models/request-full-note.model';
import { Notes } from './state/notes.model';
import { InvitedUsersToNoteOrFolder } from './models/invited-users-to-note.model';
import {
  Album,
  AudioModel,
  BaseText,
  ContentModel,
  ContentTypeENUM,
  DocumentModel,
  HeadingTypeENUM,
  NoteTextTypeENUM,
  Photo,
  VideoModel,
} from './models/content-model.model';
import { OperationResult } from './models/operation-result.model';
import { OnlineUsersNote } from './models/online-users-note.model';
import { BottomNoteContent } from './models/bottom-note-content.model';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';

@Injectable()
export class ApiServiceNotes {
  constructor(private httpClient: HttpClient) {}

  getNotes(type: NoteTypeENUM, settings: PersonalizationSetting) {
    let params = new HttpParams();
    if (settings) {
      Object.keys(settings).forEach((key) => {
        params = params.append(key, settings[key]);
      });
    }
    return this.httpClient
      .get<SmallNote[]>(`${environment.writeAPI}/api/note/type/${type}`, { params })
      .pipe(
        map((z) => TransformNoteUtil.transformNotes(z)),
        map((notes) => new Notes(type, notes)),
      );
  }

  getNotesMany(noteIds: string[], settings: PersonalizationSetting) {
    const obj = {
      noteIds,
      settings,
    };

    return this.httpClient
      .post<SmallNote[]>(`${environment.writeAPI}/api/note/many`, obj)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  getAdditionalInfos(noteIds: string[]) {
    const obj = {
      noteIds,
    };
    return this.httpClient.post<BottomNoteContent[]>(
      `${environment.writeAPI}/api/note/additional`,
      obj,
    );
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
    return this.httpClient.patch<string[]>(`${environment.writeAPI}/api/note/copy`, obj);
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

  getAll(settings: PersonalizationSetting) {
    const obj = {
      settings,
    };
    return this.httpClient
      .post<SmallNote[]>(`${environment.writeAPI}/api/note/all`, obj)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  new() {
    return this.httpClient.get<SmallNote>(`${environment.writeAPI}/api/note/new`);
  }

  getUsersOnPrivateNote(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(
      `${environment.writeAPI}/api/share/notes/user/invites/${id}`,
    );
  }

  getOnlineUsersOnNote(id: string) {
    return this.httpClient.get<OnlineUsersNote[]>(
      `${environment.writeAPI}/api/fullnote/users/${id}`,
    );
  }

  makePublic(refTypeId: RefTypeENUM, id: string) {
    const obj = {
      refTypeId,
      id,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/share`, obj);
  }

  sendInvitesToNote(
    userIds: string[],
    noteId: string,
    refTypeId: RefTypeENUM,
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

  changeUserPermission(noteId: string, userId: string, accessTypeId: RefTypeENUM) {
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
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/new`,
      obj,
    );
  }

  insertLine(
    noteId: string,
    contentId: string,
    noteTextType: NoteTextTypeENUM,
    lineBreakType: string,
    nextText?: string,
  ) {
    const obj = {
      noteId,
      contentId,
      lineBreakType,
      nextText,
      noteTextType,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/insert`,
      obj,
    );
  }

  removeContent(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/content/remove`,
      obj,
    );
  }

  updateContentText(
    noteId: string,
    contentId: string,
    content: string,
    checked: boolean,
    isBold: boolean,
    isItalic: boolean,
  ) {
    const obj = {
      contentId,
      content,
      noteId,
      checked,
      isBold,
      isItalic,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/fullnote/text`, obj);
  }

  concatWithPrevious(noteId: string, contentId: string) {
    const obj = {
      contentId,
      noteId,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/concat`,
      obj,
    );
  }

  updateContentType(
    noteId: string,
    contentId: string,
    type: NoteTextTypeENUM,
    headingType: HeadingTypeENUM,
  ) {
    const obj = {
      contentId,
      type,
      noteId,
      headingType,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/text/type`,
      obj,
    );
  }

  getContents(noteId: string): Observable<ContentModel[]> {
    return this.httpClient
      .get<ContentModel[]>(`${environment.writeAPI}/api/fullnote/contents/${noteId}`)
      .pipe(map((x) => TransformNoteUtil.transformContent(x)));
  }

  insertAlbumToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient
      .post<OperationResult<Album>>(
        `${environment.writeAPI}/api/fullnote/album/${id}/${contentId}`,
        data,
      )
      .pipe(
        map((x) => {
          // eslint-disable-next-line no-param-reassign
          x.data = new Album(x.data);
          return x;
        }),
      );
  }

  removeAlbum(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/remove`,
      obj,
    );
  }

  uploadPhotosToAlbum(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<Photo[]>>(
      `${environment.writeAPI}/api/fullnote/album/upload/${id}/${contentId}`,
      data,
    );
  }

  removePhotoFromAlbum(noteId: string, contentId: string, photoId: string) {
    return this.httpClient.delete<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/photo/${noteId}/${contentId}/${photoId}`,
    );
  }

  updateCountInRow(noteId: string, contentId: string, count: number) {
    const obj = {
      noteId,
      contentId,
      count,
    };
    return this.httpClient.patch<OperationResult<any>>(
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
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/album/size`,
      obj,
    );
  }

  // AUDIOS

  insertAudiosToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<AudioModel>>(
      `${environment.writeAPI}/api/fullnote/audios/${id}/${contentId}`,
      data,
    );
  }

  removePlaylist(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/audios/remove`,
      obj,
    );
  }

  removeAudioFromPlaylist(noteId: string, contentId: string, audioId: string) {
    return this.httpClient.delete<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/audios/${noteId}/${contentId}/${audioId}`,
    );
  }

  changePlaylistName(noteId: string, contentId: string, name: string) {
    const obj = {
      noteId,
      contentId,
      name,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/audios/name`,
      obj,
    );
  }

  uploadAudiosToPlaylist(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<AudioModel[]>>(
      `${environment.writeAPI}/api/fullnote/audios/upload/${id}/${contentId}`,
      data,
    );
  }

  // VIDEOS

  insertVideosToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<VideoModel>>(
      `${environment.writeAPI}/api/fullnote/videos/${id}/${contentId}`,
      data,
    );
  }

  removeVideoFromNote(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/videos/remove`,
      obj,
    );
  }

  // FILES

  insertFilesToNote(data: FormData, id: string, contentId: string) {
    return this.httpClient.post<OperationResult<DocumentModel>>(
      `${environment.writeAPI}/api/fullnote/files/${id}/${contentId}`,
      data,
    );
  }

  removeFileFromNote(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/files/remove`,
      obj,
    );
  }

  // LINKS

  getMetaLink(url: string) {
    const obj = {
      url,
    };
    return this.httpClient.post<any>(`${environment.writeAPI}/api/AvoidProxy`, obj);
  }
}
