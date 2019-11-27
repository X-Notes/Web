import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Noot } from '../Models/Noots/Noot';
import { FullNoot } from '../Models/Noots/FullNoot';

@Injectable({
  providedIn: 'root'
})
export class NootsService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  public GetAll() {
    return this.httpClient.get<Noot[]>(`${environment.nootsAPI + '/api/noots/all'}`);
  }
  public GetFullNoot(id: string) {
    return this.httpClient.get<FullNoot>(`${environment.nootsAPI}/api/noots/${id}`);
  }
}
