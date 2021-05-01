import { Component, EventEmitter, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppNotification } from 'src/app/core/models/app-notification';
import { ReadAllNotifications, ReadNotification } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @Output() oncloseNotification = new EventEmitter();

  @Select(AppStore.getNotifications)
  public notifications$: Observable<AppNotification>;

  @Select(AppStore.getNotificationsLength)
  public notificationsLen$: Observable<number>;

  toggleMessage = true;

  constructor(private store: Store) {}

  closeNotification() {
    this.oncloseNotification.emit();
  }

  readAllMessages() {
    this.store.dispatch(ReadAllNotifications);
  }

  read(id: string) {
    this.store.dispatch(new ReadNotification(id));
  }
}
