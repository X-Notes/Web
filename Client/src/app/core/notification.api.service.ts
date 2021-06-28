import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppNotification } from './models/app-notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationServiceAPI {
  constructor(private httpClient: HttpClient) {}

  getNotifications() {
    return this.httpClient.get<AppNotification[]>(`${environment.writeAPI}/api/notification`);
  }

  readAllNotifications() {
    return this.httpClient.get(`${environment.writeAPI}/api/notification/read/all`);
  }

  readNotification(id: string) {
    return this.httpClient.get(`${environment.writeAPI}/api/notification/read/${id}`);
  }
}
