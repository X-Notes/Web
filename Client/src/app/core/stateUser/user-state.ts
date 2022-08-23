/* eslint-disable no-restricted-properties */
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundService } from 'src/app/content/profile/background.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import {
  Logout,
  ChangeTheme,
  ChangeLanguage,
  ChangeFontSize,
  SetCurrentBackground,
  SetDefaultBackground,
  UpdateUserInfo,
  UpdateUserPhoto,
  LoadUsedDiskSpace,
  LoadPersonalization,
  UpdatePersonalization,
  Auth,
  LoadBillingPlans,
} from './user-action';
import { UserAPIService } from '../user-api.service';
import { PersonalizationSetting } from '../models/personalization-setting.model';
import { ApiPersonalizationSettingsService } from '../api-personalization-settings.service';
import { byteToMB } from '../defaults/byte-convert';
import { maxProfilePhotoSize } from '../defaults/constraints';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { BillingPlan } from '../models/billing/billing-plan';
import { ApiBillingService } from '../api-billing.service';

interface UserState {
  user: ShortUser;
  memory: number;
  personalizationSettings: PersonalizationSetting;
  billingPlans: BillingPlan[];
}

@State<UserState>({
  name: 'User',
  defaults: {
    user: {} as ShortUser,
    memory: 0,
    personalizationSettings: null,
    billingPlans: []
  },
})
@Injectable()
export class UserStore {
  constructor(
    private userApi: UserAPIService,
    private billingApi: ApiBillingService,
    private translateService: TranslateService,
    private backgroundAPI: BackgroundService,
    private apiPersonalizationSettingsService: ApiPersonalizationSettingsService,
    private snackbarStatusHandler: SnackBarHandlerStatusService,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
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
  static getUser(state: UserState): ShortUser {
    return state.user;
  }

  @Selector()
  static getUserTheme(state: UserState): ThemeENUM {
    return state.user.themeId;
  }

  @Selector()
  static getUserBackground(state: UserState): string {
    return state.user.currentBackground?.photoPath;
  }

  @Selector()
  static getUserFontSize(state: UserState): FontSizeENUM {
    return state.user.fontSizeId;
  }

  @Selector()
  static getUserLanguage(state: UserState): LanguagesENUM {
    return state.user.languageId;
  }

  @Action(Auth)
  async auth({ patchState }: StateContext<UserState>, { user }: Auth) {
    let userdb = await this.userApi.getUser().toPromise();
    if (userdb.status === OperationResultAdditionalInfo.NotFound) {
      userdb = await this.userApi.newUser(user).toPromise();
    }
    patchState({ user: userdb.data });
  }

  @Action(Logout)
  // eslint-disable-next-line class-methods-use-this
  logout({ patchState }: StateContext<UserState>) {
    patchState({ user: {} as ShortUser });
  }

  @Action(ChangeTheme)
  async changeTheme({ patchState, getState }: StateContext<UserState>, { theme }: ChangeTheme) {
    let { user } = getState();
    await this.userApi.changeTheme(theme).toPromise();
    user = { ...user, themeId: theme };
    patchState({ user });
  }

  @Action(ChangeLanguage)
  async changeLanguage(
    { patchState, getState }: StateContext<UserState>,
    { language }: ChangeLanguage,
  ) {
    await this.userApi.changeLanguage(language).toPromise();
    await this.translateService.use(LanguagesENUM[language].toLowerCase()).toPromise();
    patchState({ user: { ...getState().user, languageId: language } });
  }

  @Action(ChangeFontSize)
  async changeFontSize(
    { patchState, getState }: StateContext<UserState>,
    { fontSize }: ChangeFontSize,
  ) {
    let { user } = getState();
    await this.userApi.changeFontSize(fontSize).toPromise();
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

  @Action(UpdateUserInfo)
  async updateUserName(
    { patchState, getState }: StateContext<UserState>,
    { newName }: UpdateUserInfo,
  ) {
    await this.userApi.updateUserInfo(newName).toPromise();
    patchState({
      user: { ...getState().user, name: newName },
    });
  }

  @Action(UpdateUserPhoto)
  async updateUserPhoto(
    { patchState, getState, dispatch }: StateContext<UserState>,
    { photo }: UpdateUserPhoto,
  ) {
    const operation = this.longTermOperationsHandler.addNewProfilePhotoChangingOperation();
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Image,
      'uploader.photoChanging',
      true,
      true,
    );
    const resp = await this.userApi.updateUserPhoto(photo, mini, operation).toPromise();
    const result = resp.eventBody;
    const isNeedInterrupt = this.snackbarStatusHandler.validateStatus(
      getState().user.languageId,
      result,
      byteToMB(maxProfilePhotoSize),
    );
    if (isNeedInterrupt) {
      return;
    }

    const newPhoto = result.data;
    patchState({
      user: { ...getState().user, photoId: newPhoto.id, photoPath: newPhoto.photoPath }, // todo return link
    });
    dispatch(LoadUsedDiskSpace);
  }

  @Action(LoadUsedDiskSpace)
  async loadUsedDiskSpace({ patchState }: StateContext<UserState>) {
    const memory = await this.userApi.getMemory().toPromise();
    patchState({ memory: memory.totalSize });
  }

  @Action(LoadBillingPlans)
  async loadBillingPlans({ patchState }: StateContext<UserState>) {
    const billingPlans = await this.billingApi.getBillingPlans().toPromise();
    patchState({ billingPlans });
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
