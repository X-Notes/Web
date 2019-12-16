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
  public Update(label: Label) {
    return this.httpClient.put(`${environment.nootsAPI + '/api/labels'}`, label, this.httpOptions);
  }
  public Delete(id: string) {
    return this.httpClient.delete(`${environment.nootsAPI + `/api/labels/${id}`}`, this.httpOptions);
  }
  public GetById(id: string) {
    return this.httpClient.get<Label>(`${environment.nootsAPI + `/api/labels/${id}`}`, this.httpOptions);
  }
}
