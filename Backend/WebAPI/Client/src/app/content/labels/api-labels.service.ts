import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Label } from './models/label.model';
import { PositionEntityModel } from '../notes/models/position-note.model';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { Observable } from 'rxjs';

@Injectable()
export class ApiServiceLabels {
  constructor(private httpClient: HttpClient) {}

  getAll() {
    return this.httpClient.get<Label[]>(`${environment.api}/api/label`);
  }

  new(): Observable<OperationResult<string>> {
    return this.httpClient.post<OperationResult<string>>(`${environment.api}/api/label`, {});
  }

  setDeleted(id: string) {
    return this.httpClient.delete(`${environment.api}/api/label/${id}`);
  }

  delete(id: string) {
    return this.httpClient.delete(`${environment.api}/api/label/perm/${id}`);
  }

  updateOrder(positions: PositionEntityModel[]) {
    const obj = {
      positions,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/label/order`,
      obj,
    );
  }

  update(label: Label) {
    return this.httpClient.put(`${environment.api}/api/label`, label);
  }

  restore(id: string) {
    return this.httpClient.get(`${environment.api}/api/label/restore/${id}`);
  }

  removeAll() {
    return this.httpClient.delete(`${environment.api}/api/label`);
  }

  getCountNotes(labelId: string) {
    return this.httpClient.get<number>(`${environment.api}/api/label/count/${labelId}`);
  }
}
