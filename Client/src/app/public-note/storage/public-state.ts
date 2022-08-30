/* eslint-disable no-restricted-properties */
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { PublicUser } from './public-action';
import { PublicAPIService } from '../services/public-api.service';
import { ShortUserPublic } from '../interfaces/short-user-public.model';

interface UserState {
  owner: ShortUserPublic;
}

@State<UserState>({
  name: 'Public',
  defaults: {
    owner: {} as ShortUserPublic,
  },
})
@Injectable()
export class PublicStore {
  constructor(private api: PublicAPIService) {}

  @Selector()
  static owner(state: UserState): ShortUserPublic {
    return state.owner;
  }

  @Action(PublicUser)
  async fetchUser({ patchState }: StateContext<UserState>, { id }: PublicUser) {
    const { data } = await this.api.getPublicUser(id).toPromise();
    patchState({ owner: data });
  }
}
