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
import { OperationResultAdditionalInfo } from 'src/app/content/notes/models/operation-result.model';
import { UserStore } from '../stateUser/user-state';
import { SnackBarTranlateHelperService } from 'src/app/content/navigation/snack-bar-tranlate-helper.service';
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
    private store: Store,
    private snackbarTranlateHelper: SnackBarTranlateHelperService) {}

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

    if(result.message === OperationResultAdditionalInfo.NotEnoughMemory){
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      const message = this.snackbarTranlateHelper.getNoEnoughMemoryTranslate(lname); 
      this.store.dispatch(new ShowSnackNotification(message));
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
