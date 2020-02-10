import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NewUnknown } from '../Models/PartUnknown/NewUnknow';
import { DeleteUnknown } from '../Models/PartUnknown/DeleteUnknown';

@Injectable({
  providedIn: 'root'
})
export class PartsService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  newUnknown(part: NewUnknown) {
    return this.httpClient.post(`${environment.nootsAPI + '/api/parttext/unknown'}`, part, this.httpOptions);
  }
  deleteUnknown(part: DeleteUnknown) {
    return this.httpClient.post(`${environment.nootsAPI + '/api/parttext/unknown/delete'}`, part, this.httpOptions);
  }
}
