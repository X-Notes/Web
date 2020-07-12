import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SmallNote } from './models/smallNote';
import { environment } from 'src/environments/environment';
import { FullNote } from './models/fullNote';

@Injectable()
export class ApiServiceNotes {

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get<SmallNote[]>(environment.writeAPI + '/api/note');
  }

  get(id: number) {
    return this.httpClient.get<FullNote>(environment.writeAPI + `/api/note/${id}`);
  }

  new() {
    return this.httpClient.get<number>(environment.writeAPI + `/api/note/new`);
  }

}
