import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LanguageDTO } from 'src/app/shared/models/LanguageDTO';
import { Theme } from 'src/app/shared/models/Theme';
import { FontSize } from 'src/app/shared/models/FontSize';
import { NoteType } from 'src/app/shared/models/noteType';
import { FolderType } from 'src/app/shared/models/folderType';
import { GeneralApp } from 'src/app/shared/models/generalApp';
import { EntityRef } from 'src/app/shared/models/entityRef';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { AuthService } from '../auth.service';
import { AppServiceAPI } from '../app.service';
import {
  UpdateRoute,
  SetToken,
  TokenSetNoUpdate,
  LoadGeneralEntites,
  LoadNotifications,
} from './app-action';
import { NotificationServiceAPI } from '../notification.api.service';

interface AppState {
  routing: EntityType;
  token: string;
  tokenUpdated: boolean;
  generalApp: GeneralApp;
  notifications: Notification[];
}

@State<AppState>({
  name: 'App',
  defaults: {
    routing: null,
    token: null,
    tokenUpdated: false,
    generalApp: null,
    notifications: [],
  },
})
@Injectable()
export class AppStore {
  constructor(
    authService: AuthService, // DONT DELETE THIS ROW
    public appService: AppServiceAPI,
    public notificationService: NotificationServiceAPI,
  ) {
    authService.init();
  }

  @Selector()
  static getLanguages(state: AppState): LanguageDTO[] {
    return state.generalApp.languages;
  }

  @Selector()
  static getNotifications(state: AppState): Notification[] {
    return state.notifications;
  }

  @Selector()
  static getThemes(state: AppState): Theme[] {
    return state.generalApp.themes;
  }

  @Selector()
  static getFontSizes(state: AppState): FontSize[] {
    return state.generalApp.fontSizes;
  }

  @Selector()
  static getNoteTypes(state: AppState): NoteType[] {
    return state.generalApp.noteTypes;
  }

  @Selector()
  static getFolderTypes(state: AppState): FolderType[] {
    return state.generalApp.folderTypes;
  }

  @Selector()
  static getRefs(state: AppState): EntityRef[] {
    return state.generalApp.refs;
  }

  @Selector()
  static getToken(state: AppState): string {
    return state.token;
  }

  @Selector()
  static appLoaded(state: AppState): boolean {
    return state.tokenUpdated && state.generalApp !== null;
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
    return state.routing === EntityType.NoteInner;
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
  static getName(state: AppState): string {
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

      case EntityType.LabelPrivate: {
        return 'label';
      }
      case EntityType.LabelDeleted: {
        return 'label';
      }

      case EntityType.Profile: {
        return 'background';
      }

      case EntityType.NoteInner: {
        return 'inner-note';
      }

      case EntityType.FolderInner: {
        return 'inner-folder';
      }

      default: {
        throw new Error('error');
      }
    }
  }

  @Selector()
  static getMenuSwitch(state: AppState): string {
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
        throw new Error('Incorrect type');
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
        throw new Error('Incorrect type');
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

  @Action(LoadGeneralEntites)
  async loadGeneralEntites({ patchState }: StateContext<AppState>) {
    const general = await this.appService.getLoadGeneral().toPromise();
    patchState({ generalApp: general });
  }

  @Action(LoadNotifications)
  async loadNotifications({ patchState }: StateContext<AppState>) {
    const notifications = await this.notificationService.getNotifications().toPromise();
    patchState({ notifications });
  }
}
