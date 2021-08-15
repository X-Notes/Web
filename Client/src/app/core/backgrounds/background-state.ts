import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext, Store } from '@ngxs/store';
import { BackgroundService } from 'src/app/content/profile/background.service';
import {
  NewBackground,
  LoadBackgrounds,
  SetBackground,
  RemoveBackground,
} from './background-action';
import { Background } from '../models/background.model';
import { LoadUsedDiskSpace, SetCurrentBackground } from '../stateUser/user-action';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UserStore } from '../stateUser/user-state';
import { AppStore } from '../stateApp/app-state';
import { byteToMB } from '../defaults/byte-convert';
import { maxBackgroundPhotoSize } from '../defaults/constraints';

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
    private store: Store) {}

  @Selector()
  static getUserBackgrounds(state: BackgroundState): Background[] {
    return state.backgrounds;
  }

  @Action(NewBackground)
  async newBackground(
    { patchState, getState, dispatch }: StateContext<BackgroundState>,
    { photo }: NewBackground,
  ) {
    const result = await this.backgroundAPI.newBackground(photo).toPromise();

    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    const isNeedInterrupt = this.snackbarStatusHandler.validateStatus(language, result, byteToMB(maxBackgroundPhotoSize));
    if(isNeedInterrupt){
      return;
    }

    const background = result.data;
    patchState({
      backgrounds: [background, ...getState().backgrounds],
    });
    dispatch([new SetCurrentBackground(background), LoadUsedDiskSpace]);
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
    { patchState, getState }: StateContext<BackgroundState>,
    { id }: RemoveBackground,
  ) {
    await this.backgroundAPI.removeBackground(id).toPromise();
    patchState({
      backgrounds: getState().backgrounds.filter((x) => x.id !== id),
    });
  }
}
