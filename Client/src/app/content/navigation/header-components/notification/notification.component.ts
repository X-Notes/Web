import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppNotification } from 'src/app/core/models/notifications/app-notification.model';
import { ReadAllNotifications, ReadNotification } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @Output() oncloseNotification = new EventEmitter();

  @Select(AppStore.getNewNotifications)
  public notificationsNew$: Observable<AppNotification[]>;

  @Select(AppStore.getReadNotifications)
  public notificationsRead$: Observable<AppNotification[]>;

  @Select(AppStore.getNewNotificationsLength)
  public getNewNotificationsLength$: Observable<number>;

  @Select(AppStore.getReadNotificationsLength)
  public getReadNotificationsLength$: Observable<number>;

  toggleMessage = true;

  constructor(
    private store: Store,
    public pService: PersonalizationService,
    private router: Router,
  ) {}

  closeNotification() {
    this.oncloseNotification.emit();
  }

  readAllMessages() {
    this.store.dispatch(ReadAllNotifications);
  }

  read(id: string) {
    this.store.dispatch(new ReadNotification(id));
  }

  navigateNote(noteId: string): void {
    this.router.navigate(['/notes/', noteId]);
  }

  navigateFolder(folderId: string) {
    this.router.navigate(['/folders/', folderId]);
  }
}
