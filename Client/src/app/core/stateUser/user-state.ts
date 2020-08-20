import { ShortUser } from 'src/app/core/models/short-user';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { AuthAPIService } from '../auth-api.service';
import { Login, Logout, SetToken, TokenSetNoUpdate } from './user-action';

interface UserState {
    user: ShortUser;
    isLogin: boolean;
    token: string;
    tokenUpdated: boolean;
}

@State<UserState>({
    name: 'User',
    defaults: {
        user: null,
        isLogin: false,
        token: null,
        tokenUpdated: false
    }
})

@Injectable()
export class UserStore {

    constructor(private api: AuthAPIService) {

    }

    @Selector()
    static getTokenUpdated(state: UserState): boolean {
        return state.tokenUpdated;
    }

    @Selector()
    static getUser(state: UserState): ShortUser {
        return state.user;
    }

    @Selector()
    static getStatus(state: UserState): boolean {
        return state.isLogin;
    }

    @Selector()
    static getToken(state: UserState): string {
        return state.token;
    }

    @Action(Login)
    async login({ setState, dispatch }: StateContext<UserState>, { token, user }: Login) {
        let userdb = await this.api.getUser().toPromise();
        if (userdb === null) {
            userdb = await this.api.newUser(user).toPromise();
        }
        setState({user: userdb, isLogin: true, token, tokenUpdated: true});
    }

    @Action(Logout)
    logout({ setState }: StateContext<UserState>) {
        setState({user: null, isLogin: false, token: null, tokenUpdated: false});
    }

    @Action(SetToken)
    setToken({ patchState }: StateContext<UserState>, { token }: SetToken) {
        patchState({token, tokenUpdated: true});
    }

    @Action(TokenSetNoUpdate)
    setNoUpdateToken({ patchState }: StateContext<UserState>) {
        patchState({tokenUpdated: false});
    }
}
