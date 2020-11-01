import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SmallNote } from './models/smallNote';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { RequestFullNote } from './models/requestFullNote';
import { Notes } from './state/Notes';

@Injectable()
export class ApiServiceNotes {

  constructor(private httpClient: HttpClient) { }

  getPrivateNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/private')
    .pipe(map(z => new Notes(NoteType.Private, z)));
  }

  getSharedNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/shared')
    .pipe(map(z => new Notes(NoteType.Shared, z)));
  }

  getDeletedNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/deleted')
    .pipe(map(z => new Notes(NoteType.Deleted, z)));
  }

  getArchiveNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/archive')
    .pipe(map(z => new Notes(NoteType.Archive, z)));
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

  setDeleteNotes(ids: string[], noteType: NoteType) {
    const obj = {
      ids,
      noteType
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/delete`, obj);
  }


  makePrivateNotes(ids: string[], noteType: NoteType) {
    const obj = {
      ids,
      noteType
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/ref/private`, obj);
  }

  copyNotes(ids: string[], noteType: NoteType) {
    const obj = {
      ids,
      noteType
    };
    return this.httpClient.patch<SmallNote[]>(environment.writeAPI + `/api/note/copy`, obj);
  }

  deleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/delete/permanently`, obj);
  }

  archiveNotes(ids: string[], noteType: NoteType) {
    const obj = {
      ids,
      noteType
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/archive`, obj);
  }

  get(id: string) {
    return this.httpClient.get<RequestFullNote>(environment.writeAPI + `/api/note/${id}`);
  }

  new() {
    return this.httpClient.get<string>(environment.writeAPI + `/api/note/new`);
  }

}
