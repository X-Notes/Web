import { ShortUser } from 'src/app/core/models/short-user.model';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext, Store } from '@ngxs/store';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundService } from 'src/app/content/profile/background.service';
import { environment } from 'src/environments/environment';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { SetToken, TokenSetNoUpdate } from '../stateApp/app-action';
import {
  Login,
  Logout,
  ChangeTheme,
  ChangeLanguage,
  ChangeFontSize,
  SetCurrentBackground,
  SetDefaultBackground,
  UpdateUserName,
  UpdateUserPhoto,
  LoadUsedDiskSpace,
  LoadPersonalization,
  UpdatePersonalization,
} from './user-action';
import { UserAPIService } from '../user-api.service';
import { PersonalizationSetting } from '../models/personalization-setting.model';
import { ApiPersonalizationSettingsService } from '../api-personalization-settings.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { AppStore } from '../stateApp/app-state';
import { byteToMB } from '../defaults/byte-convert';
import { maxProfilePhotoSize } from '../defaults/constraints';

interface UserState {
  user: ShortUser;
  isLogin: boolean;
  memory: number;
  personalizationSettings: PersonalizationSetting;
}

@State<UserState>({
  name: 'User',
  defaults: {
    user: null,
    isLogin: false,
    memory: 0,
    personalizationSettings: null,
  },
})
@Injectable()
export class UserStore {
  constructor(
    private api: UserAPIService,
    private translateService: TranslateService,
    private backgroundAPI: BackgroundService,
    private apiPersonalizationSettingsService: ApiPersonalizationSettingsService,
    private snackbarStatusHandler: SnackBarHandlerStatusService,
    private store: Store
  ) {}

  @Selector()
  static getPersonalizationSettings(state: UserState): PersonalizationSetting {
    return state.personalizationSettings;
  }

  @Selector()
  static getMemoryBytes(state: UserState): number {
    return state.memory;
  }

  @Selector()
  static getMemoryKBytes(state: UserState): number {
    return state.memory / Math.pow(1024, 1);
  }

  @Selector()
  static getMemoryMBytes(state: UserState): number {
    return state.memory / Math.pow(1024, 2);
  }

  @Selector()
  static getMemoryGBytes(state: UserState): number {
    return state.memory / Math.pow(1024, 3);
  }

  @Selector()
  static getStatus(state: UserState): boolean {
    return state.isLogin;
  }

  @Selector()
  static getUser(state: UserState): ShortUser {
    return state.user;
  }

  @Selector()
  static getUserTheme(state: UserState): ThemeENUM {
    return state.user.themeId;
  }

  @Selector()
  static getUserBackground(state: UserState): string {
    const path = state.user.currentBackground?.photoPath;
    if (path) {
      return `${environment.storage}/${state.user.id}/${escape(path)}`;
    }
    return null;
  }

  @Selector()
  static getUserFontSize(state: UserState): FontSizeENUM {
    return state.user.fontSizeId;
  }

  @Selector()
  static getUserLanguage(state: UserState): LanguagesENUM {
    return state.user.languageId;
  }

  @Action(Login)
  async login({ patchState, dispatch }: StateContext<UserState>, { token, user }: Login) {
    let userdb = await this.api.getUser().toPromise();
    if (userdb === null) {
      userdb = await this.api.newUser(user).toPromise();
      dispatch(new UpdateUserPhoto(user.photo));
    }
    dispatch(new SetToken(token));
    patchState({ user: userdb, isLogin: true });
  }

  @Action(Logout)
  // eslint-disable-next-line class-methods-use-this
  logout({ patchState, dispatch }: StateContext<UserState>) {
    dispatch(new TokenSetNoUpdate());
    patchState({ user: null, isLogin: false });
  }

  @Action(ChangeTheme)
  async changeTheme({ patchState, getState }: StateContext<UserState>, { theme }: ChangeTheme) {
    let { user } = getState();
    await this.api.changeTheme(theme).toPromise();
    user = { ...user, themeId: theme };
    patchState({ user });
  }

  @Action(ChangeLanguage)
  async changeLanguage(
    { patchState, getState }: StateContext<UserState>,
    { language }: ChangeLanguage,
  ) {
    await this.api.changeLanguage(language).toPromise();
    await this.translateService.use(LanguagesENUM[language].toLowerCase()).toPromise();
    patchState({ user: { ...getState().user, languageId: language } });
  }

  @Action(ChangeFontSize)
  async changeFontSize(
    { patchState, getState }: StateContext<UserState>,
    { fontSize }: ChangeFontSize,
  ) {
    let { user } = getState();
    await this.api.changeFontSize(fontSize).toPromise();
    user = { ...user, fontSizeId: fontSize };
    patchState({ user });
  }

  @Action(SetCurrentBackground)
  // eslint-disable-next-line class-methods-use-this
  setCurrent(
    { patchState, getState }: StateContext<UserState>,
    { background }: SetCurrentBackground,
  ) {
    patchState({ user: { ...getState().user, currentBackground: background } });
  }

  @Action(SetDefaultBackground)
  async setDefault({ patchState, getState }: StateContext<UserState>) {
    await this.backgroundAPI.defaultBackground().toPromise();
    patchState({
      user: { ...getState().user, currentBackground: null },
    });
  }

  @Action(UpdateUserName)
  async updateUserName(
    { patchState, getState }: StateContext<UserState>,
    { newName }: UpdateUserName,
  ) {
    await this.api.updateUserName(newName).toPromise();
    patchState({
      user: { ...getState().user, name: newName },
    });
  }

  @Action(UpdateUserPhoto)
  async updateUserPhoto(
    { patchState, getState, dispatch }: StateContext<UserState>,
    { photo }: UpdateUserPhoto,
  ) {
    const result = await this.api.updateUserPhoto(photo).toPromise();

    const isNeedInterrupt = this.snackbarStatusHandler.validateStatus(getState().user.languageId, result, byteToMB(maxProfilePhotoSize));
    if(isNeedInterrupt){
      return;
    }

    const newPhoto = result.data;
    patchState({
      user: { ...getState().user, photoId: newPhoto.id, photoPath: newPhoto.photoPath },
    });
    dispatch(LoadUsedDiskSpace);
  }

  @Action(LoadUsedDiskSpace)
  async loadUsedDiskSpace({ patchState }: StateContext<UserState>) {
    const memory = await this.api.getMemory().toPromise();
    patchState({ memory: memory.totalSize });
  }

  @Action(LoadPersonalization)
  async loadPersonalization({ patchState }: StateContext<UserState>) {
    const pr = await this.apiPersonalizationSettingsService
      .getPersonalizationSettings()
      .toPromise();
    patchState({ personalizationSettings: pr });
  }

  @Action(UpdatePersonalization)
  async updatePersonalization(
    { patchState }: StateContext<UserState>,
    { settings }: UpdatePersonalization,
  ) {
    await this.apiPersonalizationSettingsService
      .updateUserPersonalizationSettings(settings)
      .toPromise();
    patchState({ personalizationSettings: settings });
  }
}
