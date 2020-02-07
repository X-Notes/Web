import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SmallNote } from '../Models/Notes/SmallNote';
import { UpdateTitle } from '../Models/Notes/UpdateTitle';
import { FullNote } from '../Models/Notes/FullNote';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  newNote() {
    return this.httpClient.get(`${environment.nootsAPI + '/api/notes/new'}`, {responseType: 'text'});
  }
  getAll() {
    return this.httpClient.get<SmallNote[]>(`${environment.nootsAPI + '/api/notes/all'}`, this.httpOptions);
  }
  updateTitle(updateTitle: UpdateTitle) {
    return this.httpClient.put(`${environment.nootsAPI + '/api/notes/title'}`, updateTitle, this.httpOptions);
  }
  getById(id: string) {
    return this.httpClient.get<FullNote>(`${environment.nootsAPI + `/api/notes/${id}`}`, this.httpOptions);
  }
}
