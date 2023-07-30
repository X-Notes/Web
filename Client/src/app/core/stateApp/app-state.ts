import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { patch, updateItem } from '@ngxs/store/operators';

import {
  UpdateRoute,
  LoadNotifications,
  ReadAllNotifications,
  ReadNotification,
  NewNotification,
  UpdateDragMuuriState,
  Ping,
} from './app-action';
import { NotificationServiceAPI } from '../notification.api.service';
import { AppNotification } from '../models/notifications/app-notification.model';
import { UserAPIService } from '../user-api.service';
import { SignalRService } from '../signal-r.service';

interface AppState {
  routing: EntityType | null;
  notifications: AppNotification[];
  isMuuriDragging: boolean;
}

@State<AppState>({
  name: 'App',
  defaults: {
    routing: null,
    notifications: [],
    isMuuriDragging: false
  },
})
@Injectable()
export class AppStore {
  constructor(
    public notificationService: NotificationServiceAPI, 
    private userAPIService: UserAPIService) {}

  @Selector()
  static getNewNotifications(state: AppState): AppNotification[] {
    const notifications = state.notifications
      .filter((notif) => !notif.isRead)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return notifications;
  }

  @Selector()
  static getNewNotificationsLength(state: AppState): number {
    const notifications = state.notifications.filter((notif) => !notif.isRead);
    return notifications.length;
  }

  @Selector()
  static getReadNotificationsLength(state: AppState): number {
    const notifications = state.notifications.filter((notif) => notif.isRead);
    return notifications.length;
  }

  @Selector()
  static getReadNotifications(state: AppState): AppNotification[] {
    const notifications = state.notifications
      .filter((notif) => notif.isRead)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return notifications;
  }

  @Selector()
  static getNotificationsCount(state: AppState): number {
    return state.notifications.filter((q) => q.isRead === false).length;
  }

  @Selector()
  static isFolderInner(state: AppState): boolean {
    return state.routing === EntityType.FolderInner;
  }

  @Selector()
  static isNoteInner(state: AppState): boolean {
    return state.routing === EntityType.NoteInner || state.routing === EntityType.FolderInnerNote;
  }

  @Selector()
  static isNoteInnerPure(state: AppState): boolean {
    return state.routing === EntityType.NoteInner;
  }

  @Selector()
  static isFolderInnerNote(state: AppState): boolean {
    return state.routing === EntityType.FolderInnerNote;
  }

  @Selector()
  static IsMuuriDragging(state: AppState): boolean {
    return state.isMuuriDragging;
  }

  @Selector()
  static isDeletedFoldersNotesLabels(state: AppState): boolean {
    return (
      state.routing === EntityType.LabelDeleted ||
      state.routing === EntityType.NoteDeleted ||
      state.routing === EntityType.FolderDeleted
    );
  }

  @Selector()
  static isFolder(state: AppState): boolean {
    return (
      state.routing === EntityType.FolderShared ||
      state.routing === EntityType.FolderDeleted ||
      state.routing === EntityType.FolderPrivate ||
      state.routing === EntityType.FolderArchive ||
      state.routing === EntityType.FolderInner
    );
  }

  @Selector()
  static isSharedFolder(state: AppState): boolean {
    return state.routing === EntityType.FolderShared;
  }

  @Selector()
  static isNote(state: AppState): boolean {
    return (
      state.routing === EntityType.NoteShared ||
      state.routing === EntityType.NoteDeleted ||
      state.routing === EntityType.NotePrivate ||
      state.routing === EntityType.NoteArchive ||
      state.routing === EntityType.NoteInner
    );
  }

  @Selector()
  static isSharedNote(state: AppState): boolean {
    return state.routing === EntityType.NoteShared;
  }

  @Selector()
  static isDelete(state: AppState): boolean {
    return state.routing === EntityType.NoteDeleted || state.routing === EntityType.FolderDeleted;
  }

  @Selector()
  static isProfile(state: AppState): boolean {
    return state.routing === EntityType.Profile;
  }

  @Selector()
  static isActionFilterButton(state: AppState): boolean {
    return state.routing !== EntityType.NoteShared && state.routing !== EntityType.FolderShared;
  }

  @Selector()
  static getName(state: AppState): string {
    switch (state.routing) {
      case EntityType.FolderPrivate:
      case EntityType.FolderShared:
      case EntityType.FolderDeleted:
      case EntityType.FolderArchive:
        return 'folder';
      case EntityType.FolderInner:
        return 'inner-folder';
      case EntityType.FolderInnerNote:
        return 'inner-note';

      case EntityType.NotePrivate:
      case EntityType.NoteArchive:
      case EntityType.NoteDeleted:
      case EntityType.NoteShared:
        return 'note';
      case EntityType.NoteInner:
        return 'inner-note';

      case EntityType.LabelPrivate:
      case EntityType.LabelDeleted:
        return 'label';

      case EntityType.Profile:
        return 'background';

      case EntityType.History:
        return 'history';

      default:
        throw new Error('error');
    }
  }

  @Selector()
  static getMenuSwitch(state: AppState): string {
    switch (state.routing) {
      // FOLDERS
      case EntityType.FolderPrivate:
      case EntityType.FolderShared:
      case EntityType.FolderArchive:
      case EntityType.FolderDeleted:
        return 'items';
      case EntityType.FolderInner:
        return 'folder-inner';
      case EntityType.FolderInnerNote:
        return 'note-inner';

      // NOTES
      case EntityType.NotePrivate:
      case EntityType.NoteShared:
      case EntityType.NoteArchive:
      case EntityType.NoteDeleted:
        return 'items';

      case EntityType.NoteInner:
        return 'note-inner';

      // LABELS
      case EntityType.LabelPrivate:
        return 'label';

      case EntityType.LabelDeleted:
        return 'label-delete';

      // PROFILE
      case EntityType.Profile:
        return 'profile';

      case EntityType.History:
        return 'history';

      default:
        throw new Error('error');
    }
  }

  @Selector()
  static getRouting(state: AppState): EntityType | null {
    return state.routing;
  }

  @Selector()
  // eslint-disable-next-line consistent-return
  static getTypeNote(state: AppState): NoteTypeENUM | undefined {
    switch (state.routing) {
      case EntityType.NotePrivate: {
        return NoteTypeENUM.Private;
      }
      case EntityType.NoteArchive: {
        return NoteTypeENUM.Archive;
      }
      case EntityType.NoteDeleted: {
        return NoteTypeENUM.Deleted;
      }
      case EntityType.NoteShared: {
        return NoteTypeENUM.Shared;
      }
      default: {
        if (state.routing) {
          throw new Error('Incorrect type');
        }
      }
    }
  }

  @Selector()
  // eslint-disable-next-line consistent-return
  static getTypeFolder(state: AppState): FolderTypeENUM | undefined {
    switch (state.routing) {
      case EntityType.FolderPrivate: {
        return FolderTypeENUM.Private;
      }
      case EntityType.FolderShared: {
        return FolderTypeENUM.Shared;
      }
      case EntityType.FolderDeleted: {
        return FolderTypeENUM.Deleted;
      }
      case EntityType.FolderArchive: {
        return FolderTypeENUM.Archive;
      }
      default: {
        if (state.routing) {
          throw new Error('Incorrect type');
        }
      }
    }
  }

  // UPPER MENU SELECTORS

  @Selector()
  static getNewButtonActive(state: AppState): boolean {
    return (
      (state.routing === EntityType.LabelPrivate ||
        state.routing === EntityType.NoteArchive ||
        state.routing === EntityType.NoteDeleted ||
        state.routing === EntityType.NotePrivate ||
        state.routing === EntityType.NoteShared ||
        state.routing === EntityType.FolderArchive ||
        state.routing === EntityType.FolderDeleted ||
        state.routing === EntityType.FolderPrivate ||
        state.routing === EntityType.FolderShared) &&
      state.routing !== null
    );
  }

  @Action(UpdateDragMuuriState)
  async updateDragMuuriState({ patchState }: StateContext<AppState>, { active }: UpdateDragMuuriState) {
    patchState({ isMuuriDragging: active });
  }

  @Action(Ping)
  // eslint-disable-next-line no-empty-pattern
  async ping({ }: StateContext<AppState>, { connectionId }: Ping) {
    await this.userAPIService.ping(connectionId).toPromise();
  }

  @Action(UpdateRoute)
  async updateRoute({ patchState }: StateContext<AppState>, { type }: UpdateRoute) {
    patchState({ routing: type });
  }

  @Action(LoadNotifications)
  async loadNotifications({ patchState }: StateContext<AppState>) {
    const notifications = await this.notificationService.getNotifications().toPromise();
    patchState({ notifications });
  }

  @Action(ReadAllNotifications)
  async readAllNotifications({ patchState, getState }: StateContext<AppState>) {
    await this.notificationService.readAllNotifications().toPromise();
    let { notifications } = getState();
    notifications = [...notifications].map((not) => {
      return new AppNotification({ ...not, isRead: true });
    });
    patchState({ notifications });
  }

  @Action(ReadNotification)
  async readNotification({ setState, getState }: StateContext<AppState>, { id }: ReadNotification) {
    let notification = getState().notifications.find((x) => x.id === id && !x.isRead);
    if (!notification) return;
    await this.notificationService.readNotification(id).toPromise();
    notification = new AppNotification({ ...notification, isRead: true });
    setState(
      patch({
        notifications: updateItem<AppNotification>((ent) => ent.id === id, notification),
      }),
    );
  }

  @Action(NewNotification)
  // eslint-disable-next-line class-methods-use-this
  async newNotification(
    { getState, patchState }: StateContext<AppState>,
    { notification }: NewNotification,
  ) {
    patchState({
      notifications: [notification, ...getState().notifications],
    });
  }
}
