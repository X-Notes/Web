import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Label } from './models/label';

@Injectable()
export class ApiServiceLabels {

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get<Label[]>(environment.writeAPI + '/api/label');
  }

  new(name: string, color: string) {
    const body = {
      name,
      color
    };
    return this.httpClient.post<number>(environment.writeAPI + '/api/label', body);
  }

  setDeleted(id: number) {
    return this.httpClient.delete(environment.writeAPI + `/api/label/${id}`);
  }

  delete(id: number) {
    return this.httpClient.delete(environment.writeAPI + `/api/label/perm/${id}`);
  }

  update(label: Label) {
    return this.httpClient.put(environment.writeAPI + `/api/label`, label);
  }

}
