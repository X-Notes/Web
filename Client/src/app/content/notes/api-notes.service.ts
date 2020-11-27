import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SmallNote } from './models/smallNote';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { RequestFullNote } from './models/requestFullNote';
import { Notes } from './state/Notes';
import { InvitedUsersToNote } from './models/invitedUsersToNote';
import { RefType } from 'src/app/core/models/refType';

@Injectable()
export class ApiServiceNotes {

  constructor(private httpClient: HttpClient) { }

  getPrivateNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/private')
    .pipe(map(z => {
      z.forEach(note => note.noteType = NoteType.Private);
      return new Notes(NoteType.Private, z);
    }));
  }

  getSharedNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/shared')
    .pipe(map(z => {
      z.forEach(note => note.noteType = NoteType.Shared);
      return new Notes(NoteType.Shared, z);
    }));
  }

  getDeletedNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/deleted')
    .pipe(map(z => {
      z.forEach(note => note.noteType = NoteType.Deleted);
      return new Notes(NoteType.Deleted, z);
    }));
  }

  getArchiveNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/archive')
    .pipe(map(z => {
      z.forEach(note => note.noteType = NoteType.Archive);
      return new Notes(NoteType.Archive, z);
    }));
  }


  addLabel(labelId: number, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/label/add`, obj);
  }

  removeLabel(labelId: number, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/label/remove`, obj);
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/color`, obj);
  }

  setDeleteNotes(ids: string[]) {
    const obj = {
      ids
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/delete`, obj);
  }


  makePrivateNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/ref/private`, obj);
  }

  copyNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<SmallNote[]>(environment.writeAPI + `/api/note/copy`, obj);
  }

  deleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/delete/permanently`, obj);
  }

  archiveNotes(ids: string[]) {
    const obj = {
      ids
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/archive`, obj);
  }

  get(id: string) {
    return this.httpClient.get<RequestFullNote>(environment.writeAPI + `/api/note/${id}`);
  }

  new() {
    return this.httpClient.get<string>(environment.writeAPI + `/api/note/new`);
  }

  getUsersOnPrivateNote(id: string) {
    return this.httpClient.get<InvitedUsersToNote[]>(environment.writeAPI + `/api/share/notes/user/invites/${id}`);
  }

  makePublic(refType: RefType, id: string) {
    const obj = {
      refType,
      id
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/notes/share`, obj);
  }

  sendInvitesToNote(userIds: number[], noteId: string, refType: RefType, sendMessage: boolean, message: string) {
    const obj = {
      userIds,
      noteId,
      refType,
      sendMessage,
      message
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/notes/user/invites`, obj);
  }

  removeUserFromPrivateNote(noteId: string, userId: number) {
    const obj = {
      noteId,
      userId
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/notes/user/remove`, obj);
  }

  changeUserPermission(noteId: string, userId: number, accessType: RefType) {
    const obj = {
      noteId,
      userId,
      accessType
    };
    return this.httpClient.post(environment.writeAPI + `/api/share/notes/user/permission`, obj);
  }
  // FULL NOTE

  updateTitle(title: string, id: string) {
    const obj = {
      title,
      id
    };
    return this.httpClient.patch(environment.writeAPI + `/api/fullnote/title`, obj);
  }
}
