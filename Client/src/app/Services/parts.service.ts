import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NewText } from '../Models/PartText/NewText';

@Injectable({
  providedIn: 'root'
})
export class PartsService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }


  newText(part: NewText) {
    return this.httpClient.post(`${environment.nootsAPI + '/api/parttext/new'}`, part, {responseType: 'text'});
  }
}
