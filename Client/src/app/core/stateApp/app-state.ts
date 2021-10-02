import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { patch, updateItem } from '@ngxs/store/operators';
import { AuthService } from '../auth.service';

import {
  UpdateRoute,
  SetToken,
  TokenSetNoUpdate,
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
  token: string;
  tokenUpdated: boolean;
  notifications: AppNotification[];
  snackNotification: string;
}

@State<AppState>({
  name: 'App',
  defaults: {
    routing: null,
    token: null,
    tokenUpdated: false,
    notifications: [],
    snackNotification: null,
  },
})
@Injectable()
export class AppStore {
  constructor(
    authService: AuthService, 
    public notificationService: NotificationServiceAPI) {
    authService.init();
  }

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
  static appLoaded(state: AppState): boolean {
    return state.tokenUpdated;
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
  static getToken(state: AppState): string {
    return state.token;
  }

  @Selector()
  static isTokenUpdated(state: AppState): boolean {
    return state.tokenUpdated;
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
    // TODO REFACTOR
    switch (state.routing) {
      case EntityType.FolderPrivate: {
        return 'folder';
      }
      case EntityType.FolderShared: {
        return 'folder';
      }
      case EntityType.FolderDeleted: {
        return 'folder';
      }
      case EntityType.FolderArchive: {
        return 'folder';
      }
      case EntityType.FolderInner: {
        return 'inner-folder';
      }
      case EntityType.FolderInnerNote: {
        return 'inner-note';
      }

      case EntityType.NotePrivate: {
        return 'note';
      }
      case EntityType.NoteArchive: {
        return 'note';
      }
      case EntityType.NoteDeleted: {
        return 'note';
      }
      case EntityType.NoteShared: {
        return 'note';
      }
      case EntityType.NoteInner: {
        return 'inner-note';
      }

      case EntityType.LabelPrivate: {
        return 'label';
      }
      case EntityType.LabelDeleted: {
        return 'label';
      }

      case EntityType.Profile: {
        return 'background';
      }

      default: {
        throw new Error('error');
      }
    }
  }

  @Selector()
  static getMenuSwitch(state: AppState): string {
    // TODO REFACTOR
    switch (state.routing) {
      // FOLDERS
      case EntityType.FolderPrivate: {
        return 'items';
      }
      case EntityType.FolderShared: {
        return 'items';
      }
      case EntityType.FolderArchive: {
        return 'items';
      }
      case EntityType.FolderDeleted: {
        return 'items';
      }
      case EntityType.FolderInner: {
        return 'folder-inner';
      }
      case EntityType.FolderInnerNote: {
        return 'note-inner';
      }

      // NOTES
      case EntityType.NotePrivate: {
        return 'items';
      }
      case EntityType.NoteShared: {
        return 'items';
      }
      case EntityType.NoteArchive: {
        return 'items';
      }
      case EntityType.NoteDeleted: {
        return 'items';
      }
      case EntityType.NoteInner: {
        return 'note-inner';
      }

      // LABELS
      case EntityType.LabelPrivate: {
        return 'label';
      }
      case EntityType.LabelDeleted: {
        return 'label-delete';
      }

      // PROFILE
      case EntityType.Profile: {
        return 'profile';
      }

      case EntityType.History: {
        return 'history';
      }

      default: {
        throw new Error('error');
      }
    }
  }

  @Selector()
  static getRouting(state: AppState): EntityType {
    return state.routing;
  }

  @Selector()
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
        if(state.routing){
          console.log(state.routing);
          throw new Error('Incorrect type');
        }
      }
    }
  }

  @Selector()
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
        if(state.routing){
          throw new Error('Incorrect type');
        }
      }
    }
  }

  // UPPER MENU SELECTORS

  @Selector()
  static getNewButtonActive(state: AppState): boolean {
    return (
      !this.isNoteInner(state) &&
      !this.isFolderInner(state) &&
      state.routing !== EntityType.LabelDeleted &&
      state.routing !== null
    );
  }

  @Action(UpdateRoute)
  // eslint-disable-next-line class-methods-use-this
  async updateRoute({ patchState }: StateContext<AppState>, { type }: UpdateRoute) {
    patchState({ routing: type });
  }

  @Action(SetToken)
  // eslint-disable-next-line class-methods-use-this
  setToken({ patchState }: StateContext<AppState>, { token }: SetToken) {
    patchState({ token, tokenUpdated: true });
  }

  @Action(TokenSetNoUpdate)
  // eslint-disable-next-line class-methods-use-this
  setNoUpdateToken({ patchState }: StateContext<AppState>) {
    patchState({ token: null, tokenUpdated: false });
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
  async showSnackNotifications({ getState, patchState }: StateContext<AppState>, {notification}: ShowSnackNotification){
    patchState({
      snackNotification: notification
    });
  }
}
