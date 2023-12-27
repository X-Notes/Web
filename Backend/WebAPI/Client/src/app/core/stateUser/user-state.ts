/* eslint-disable no-restricted-properties */
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { TranslateService } from '@ngx-translate/core';
import { BackgroundService } from 'src/app/content/profile/background.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import {
  Logout,
  ChangeTheme,
  ChangeLanguage,
  ChangeEntitiesSize,
  SetCurrentBackground,
  SetDefaultBackground,
  UpdateUserInfo,
  UpdateUserPhoto,
  LoadUsedDiskSpace,
  LoadPersonalization,
  UpdatePersonalization,
  Auth,
  LoadBillingPlans,
  UpdateBillingUserPlan,
} from './user-action';
import { UserAPIService } from '../user-api.service';
import { PersonalizationSetting } from '../models/personalization-setting.model';
import { ApiPersonalizationSettingsService } from '../api-personalization-settings.service';
import { byteToMB } from '../defaults/byte-convert';
import { maxProfilePhotoSize } from '../defaults/constraints';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { BillingPlan } from '../models/billing/billing-plan';
import { ApiBillingService } from '../api-billing.service';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { BillingPlanId } from '../models/billing/billing-plan-id.enum';
import { SortedByENUM } from '../models/sorted-by.enum';

export interface UserState {
  user: ShortUser;
  memory: number;
  personalizationSettings: PersonalizationSetting | null;
  billingPlans: BillingPlan[];
}

@State<UserState>({
  name: 'User',
  defaults: {
    user: {} as ShortUser,
    memory: 0,
    personalizationSettings: null,
    billingPlans: [],
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
    private snackbarService: SnackbarService,
  ) { }

  @Selector()
  static getPersonalizationSettings(state: UserState): PersonalizationSetting | null {
    return state.personalizationSettings;
  }

  @Selector()
  static getBillingsPlans(state: UserState): BillingPlan[] {
    return state.billingPlans;
  }

  @Selector()
  static getActiveBillingsPlans(state: UserState): BillingPlan[] {
    return state.billingPlans.filter((x) => x.id === BillingPlanId.Standard);
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
  static isLogged(state: UserState): boolean {
    return state.user !== null && Object.keys(state.user).length > 0;
  }

  @Selector()
  static getUserTheme(state: UserState): ThemeENUM {
    return state.user.themeId;
  }

  @Selector()
  static getUserBillingPlan(state: UserState): BillingPlanId {
    return state.user.billingPlanId;
  }

  @Selector()
  static getUserBackground(state: UserState): string | undefined {
    return state.user.currentBackground?.photoPath;
  }

  @Selector()
  static getUserFontSize(state: UserState): EntitiesSizeENUM {
    return state.user.fontSizeId;
  }

  @Selector()
  static getUserLanguage(state: UserState): LanguagesENUM {
    return state.user.languageId;
  }

  @Action(Auth)
  async auth({ patchState }: StateContext<UserState>) {
    const userdb = await this.userApi.getUser().toPromise();
    if (userdb.status === OperationResultAdditionalInfo.NotFound) {
      throw new Error('User doesn`t exist');
    }
    patchState({ user: userdb.data });
  }

  @Action(Logout)
  // eslint-disable-next-line class-methods-use-this
  async logout({ patchState }: StateContext<UserState>, { refreshToken }: Logout) {
    patchState({ user: {} as ShortUser });
    await this.userApi.logout(refreshToken).toPromise();
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

  @Action(ChangeEntitiesSize)
  async changeFontSize(
    { patchState, getState }: StateContext<UserState>,
    { fontSize }: ChangeEntitiesSize,
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

  @Action(UpdateBillingUserPlan)
  async updateBillingUserPlan(
    { patchState, getState }: StateContext<UserState>,
    { billingPlan }: UpdateBillingUserPlan,
  ) {
    patchState({
      user: { ...getState().user, billingPlanId: billingPlan },
    });
  }

  @Action(UpdateUserPhoto)
  async updateUserPhoto(
    { patchState, getState, dispatch }: StateContext<UserState>,
    { photo }: UpdateUserPhoto,
  ) {
    const operation = this.longTermOperationsHandler.addNewProfilePhotoChangingOperation();
    const result = await this.userApi.updateUserPhoto(photo, operation).toPromise();
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
    let pr = await this.apiPersonalizationSettingsService
      .getPersonalizationSettings()
      .toPromise();
    pr ??= {
      sortedFolderByTypeId: SortedByENUM.DescDate,
      sortedNoteByTypeId: SortedByENUM.DescDate,
      notesInFolderCount: 5,
      contentInNoteCount: 5,
      isViewAudioOnNote: true,
      isViewDocumentOnNote: true,
      isViewPhotosOnNote: true,
      isViewTextOnNote: true,
      isViewVideoOnNote: true,
    } as PersonalizationSetting
    patchState({ personalizationSettings: pr });
  }

  @Action(UpdatePersonalization)
  async updatePersonalization(
    { patchState }: StateContext<UserState>,
    { settings }: UpdatePersonalization,
  ) {
    const res = await this.apiPersonalizationSettingsService
      .updateUserPersonalizationSettings(settings)
      .toPromise();
    if (!res.success && res.status === OperationResultAdditionalInfo.BillingError) {
      const message = this.translateService.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, undefined, undefined, 5000);
    }
    if (res.success) {
      patchState({ personalizationSettings: settings });
    }
  }
}
