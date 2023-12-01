import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppNotification } from './models/notifications/app-notification.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationServiceAPI {
  constructor(private httpClient: HttpClient) {}

  getNotifications() {
    return this.httpClient
      .get<AppNotification[]>(`${environment.api}/api/notification`)
      .pipe(map((x) => x.map((q) => new AppNotification(q))));
  }

  readAllNotifications() {
    return this.httpClient.get(`${environment.api}/api/notification/read/all`);
  }

  readNotification(id: string) {
    return this.httpClient.get(`${environment.api}/api/notification/read/${id}`);
  }
}
