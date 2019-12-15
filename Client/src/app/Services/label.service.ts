import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NewLabel } from '../Models/Labels/NewLabel';
import { environment } from 'src/environments/environment';
import { Label } from '../Models/Labels/Label';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  public CreateLabel(newLabel: NewLabel) {
    return this.httpClient.post<string>(`${environment.nootsAPI + '/api/labels'}`, newLabel, this.httpOptions);
  }
  public GetUserLabels() {
    return this.httpClient.get<Label[]>(`${environment.nootsAPI + '/api/labels'}`, this.httpOptions);
  }
}
