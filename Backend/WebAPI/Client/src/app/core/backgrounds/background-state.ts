import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext, Store } from '@ngxs/store';
import { BackgroundService } from 'src/app/content/profile/background.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermsIcons } from 'src/app/content/long-term-operations-handler/models/long-terms.icons';
import {
  NewBackground,
  LoadBackgrounds,
  SetBackground,
  RemoveBackground,
} from './background-action';
import { Background } from '../models/background.model';
import { LoadUsedDiskSpace, SetCurrentBackground } from '../stateUser/user-action';
import { UserStore } from '../stateUser/user-state';
import { byteToMB } from '../defaults/byte-convert';
import { maxBackgroundPhotoSize } from '../defaults/constraints';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { TranslateService } from '@ngx-translate/core';
import { ShowSnackNotification } from '../stateApp/app-action';

interface BackgroundState {
  backgrounds: Background[];
}

@State<BackgroundState>({
  name: 'Backgrounds',
  defaults: {
    backgrounds: [],
  },
})
@Injectable()
export class BackgroundStore {
  constructor(
    private backgroundAPI: BackgroundService,
    private snackbarStatusHandler: SnackBarHandlerStatusService,
    private store: Store,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private translate: TranslateService,
  ) { }

  @Selector()
  static getUserBackgrounds(state: BackgroundState): Background[] {
    return state.backgrounds;
  }

  @Action(NewBackground)
  async newBackground(
    { patchState, getState, dispatch }: StateContext<BackgroundState>,
    { photo }: NewBackground,
  ) {
    const operation = this.longTermOperationsHandler.addNewBackgroundChangingOperation();
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Image,
      'background changing',
      true,
      true,
    );
    const resp = await this.backgroundAPI.newBackground(photo, mini, operation).toPromise();
    const result = resp.eventBody;
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);

    this.snackbarStatusHandler.validateStatus(language, result, byteToMB(maxBackgroundPhotoSize));
    if(result.status === OperationResultAdditionalInfo.BillingError) {
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.store.dispatch(new ShowSnackNotification(message, 5000));
      return;
    }

    if (result.success) {
      const background = result.data;
      patchState({
        backgrounds: [background, ...getState().backgrounds],
      });
      dispatch([new SetCurrentBackground(background), LoadUsedDiskSpace]);
    }
  }

  @Action(LoadBackgrounds)
  async loadBackgrounds({ patchState }: StateContext<BackgroundState>) {
    const backs = await this.backgroundAPI.getBackgrounds().toPromise();
    patchState({ backgrounds: [...backs] });
  }

  @Action(SetBackground)
  async setBackground(
    { getState, dispatch }: StateContext<BackgroundState>,
    { id }: SetBackground,
  ) {
    await this.backgroundAPI.setBackground(id).toPromise();
    const background = getState().backgrounds.find((x) => x.id === id);
    dispatch(new SetCurrentBackground(background));
  }

  @Action(RemoveBackground)
  async removeBackground(
    { patchState, getState, dispatch }: StateContext<BackgroundState>,
    { id }: RemoveBackground,
  ) {
    await this.backgroundAPI.removeBackground(id).toPromise();
    patchState({
      backgrounds: getState().backgrounds.filter((x) => x.id !== id),
    });
    dispatch(LoadUsedDiskSpace);
  }
}
