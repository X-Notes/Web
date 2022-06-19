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
  ShowSnackNotification,
} from './app-action';
import { NotificationServiceAPI } from '../notification.api.service';
import { AppNotification } from '../models/app-notification.model';

interface AppState {
  routing: EntityType;
  notifications: AppNotification[];
  snackNotification: string;
}

@State<AppState>({
  name: 'App',
  defaults: {
    routing: null,
    notifications: [],
    snackNotification: null,
  },
})
@Injectable()
export class AppStore {
  constructor(public notificationService: NotificationServiceAPI) {}

  @Selector()
  static getSnackBarNotification(state: AppState): string {
    return state.snackNotification;
  }

  @Selector()
  static getNewNotifications(state: AppState): AppNotification[] {
    const notifications = state.notifications.filter((notif) => !notif.isRead);
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
    const notifications = state.notifications.filter((notif) => notif.isRead);
    return notifications;
  }

  @Selector()
  static getNotificationsCount(state: AppState): number {
    return state.notifications.filter((z) => z.isRead === false).length;
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
  static getRouting(state: AppState): EntityType {
    return state.routing;
  }

  @Selector()
  // eslint-disable-next-line consistent-return
  static getTypeNote(state: AppState): NoteTypeENUM {
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
  static getTypeFolder(state: AppState): FolderTypeENUM {
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
        state.routing === EntityType.FolderShared ||
        state.routing === EntityType.FolderInner) &&
      state.routing !== null
    );
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
      return { ...not, isRead: true };
    });
    patchState({ notifications });
  }

  @Action(ReadNotification)
  async readNotification({ setState }: StateContext<AppState>, { id }: ReadNotification) {
    await this.notificationService.readNotification(id).toPromise();
    setState(
      patch({
        notifications: updateItem<AppNotification>(
          (notification) => notification.id === id,
          patch({ isRead: true }),
        ),
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

  @Action(ShowSnackNotification)
  // eslint-disable-next-line class-methods-use-this
  async showSnackNotifications(
    { patchState }: StateContext<AppState>,
    { notification }: ShowSnackNotification,
  ) {
    patchState({ snackNotification: notification });
  }
}
