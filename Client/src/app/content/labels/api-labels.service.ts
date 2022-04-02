import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Label } from './models/label.model';
import { PositionEntityModel } from '../notes/models/position-note.model';
import { OperationResult } from 'src/app/shared/models/operation-result.model';

@Injectable()
export class ApiServiceLabels {
  constructor(private httpClient: HttpClient) {}

  getAll() {
    return this.httpClient.get<Label[]>(`${environment.writeAPI}/api/label`);
  }

  new() {
    return this.httpClient.post<string>(`${environment.writeAPI}/api/label`, {});
  }

  setDeleted(id: string) {
    return this.httpClient.delete(`${environment.writeAPI}/api/label/${id}`);
  }

  delete(id: string) {
    return this.httpClient.delete(`${environment.writeAPI}/api/label/perm/${id}`);
  }

  updateOrder(positions: PositionEntityModel[]) {
    const obj = {
      positions,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/label/order`,
      obj,
    );
  }

  update(label: Label) {
    return this.httpClient.put(`${environment.writeAPI}/api/label`, label);
  }

  restore(id: string) {
    return this.httpClient.get(`${environment.writeAPI}/api/label/restore/${id}`);
  }

  removeAll() {
    return this.httpClient.delete(`${environment.writeAPI}/api/label`);
  }

  getCountNotes(labelId: string) {
    return this.httpClient.get<number>(`${environment.writeAPI}/api/label/count/${labelId}`);
  }
}
