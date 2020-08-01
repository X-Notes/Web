import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SmallNote } from './models/smallNote';
import { environment } from 'src/environments/environment';
import { FullNote } from './models/fullNote';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiServiceNotes {

  constructor(private httpClient: HttpClient) { }

  getPrivateNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/private');
  }

  getSharedNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/shared');
  }

  getDeletedNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/deleted');
  }

  getArchiveNotes() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note/archive');
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color
    };
    return this.httpClient.patch(environment.writeAPI + `/api/note/color`, obj);
  }

  get(id: string) {
    return this.httpClient.get<FullNote>(environment.writeAPI + `/api/note/${id}`);
  }

  new() {
    return this.httpClient.get<string>(environment.writeAPI + `/api/note/new`);
  }

}
