import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SmallNote } from '../Models/Notes/SmallNote';

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
}
