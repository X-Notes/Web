import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationServiceAPI {
  constructor(private httpClient: HttpClient) {}

  getNotifications() {
    return this.httpClient.get<Notification[]>(`${environment.writeAPI}/api/notification`);
  }
}
