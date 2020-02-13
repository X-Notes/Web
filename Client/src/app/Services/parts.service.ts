import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NewLine } from '../Models/PartText/NewLine';
import { UpdateText } from '../Models/PartText/UpdateText';


@Injectable({
  providedIn: 'root'
})
export class PartsService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }


  newLine(part: NewLine) {
    return this.httpClient.post(`${environment.nootsAPI + '/api/parttext/line'}`, part, {responseType: 'text'});
  }
  updateText(text: UpdateText) {
    return this.httpClient.put(`${environment.nootsAPI + '/api/parttext'}`, text, this.httpOptions);
  }
}
