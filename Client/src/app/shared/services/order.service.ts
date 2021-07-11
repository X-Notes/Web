import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export enum OrderEntity {
  Note,
  Folder,
  Label,
}

export interface Order {
  orderEntity: OrderEntity;
  position: number;
  entityId: string;
}

export interface OrderResponse {
  entityId: string;
  newOrder: number;
}

@Injectable()
export class OrderService {
  constructor(private httpClient: HttpClient) {}

  changeOrder(order: Order) {
    return this.httpClient.post<OrderResponse[]>(`${environment.writeAPI}/api/order`, order);
  }
}
