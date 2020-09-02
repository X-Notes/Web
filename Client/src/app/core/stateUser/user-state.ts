import { ShortUser } from 'src/app/core/models/short-user';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { UserAPIService } from '../user-api.service';
import { Login, Logout, SetToken, TokenSetNoUpdate, ChangeTheme, ChangeLanguage, ChangeFontSize } from './user-action';
import { Theme } from 'src/app/shared/enums/Theme';
import { Language } from 'src/app/shared/enums/Language';
import { TranslateService } from '@ngx-translate/core';
import { FontSize } from 'src/app/shared/enums/FontSize';

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

    constructor(private api: UserAPIService,
                private translateService: TranslateService) {

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
    static getUserTheme(state: UserState): Theme {
        return state.user.theme;
    }

    @Selector()
    static getUserFontSize(state: UserState): FontSize {
        return state.user.fontSize;
    }

    @Selector()
    static getUserLanguage(state: UserState): Language {
        return state.user.language;
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
        setState({ user: userdb, isLogin: true, token, tokenUpdated: true });
    }

    @Action(Logout)
    logout({ setState }: StateContext<UserState>) {
        setState({ user: null, isLogin: false, token: null, tokenUpdated: false });
    }

    @Action(SetToken)
    setToken({ patchState }: StateContext<UserState>, { token }: SetToken) {
        patchState({ token, tokenUpdated: true });
    }

    @Action(TokenSetNoUpdate)
    setNoUpdateToken({ patchState }: StateContext<UserState>) {
        patchState({ tokenUpdated: false });
    }

    @Action(ChangeTheme)
    async changeTheme({ patchState, getState }: StateContext<UserState>) {
        let user = getState().user;
        if (user.theme === Theme.Light) {
            await this.api.changeTheme(Theme.Dark).toPromise();
            user = {...user, theme: Theme.Dark};
        } else {
            await this.api.changeTheme(Theme.Light).toPromise();
            user = {...user, theme: Theme.Light};
        }
        patchState({ user });
    }

    @Action(ChangeLanguage)
    async changeLanguage({ patchState, getState }: StateContext<UserState>, {language}: ChangeLanguage ) {
        await this.api.changeLanguage(language).toPromise();
        await this.translateService.use(language).toPromise();
        patchState({ user: {...getState().user, language}});
    }

    @Action(ChangeFontSize)
    async changeFontSize({ patchState, getState }: StateContext<UserState>) {
        let user = getState().user;
        if (user.fontSize === FontSize.Big) {
            await this.api.changeFontSize(FontSize.Medium).toPromise();
            user = {...user, fontSize: FontSize.Medium};
        } else {
            await this.api.changeFontSize(FontSize.Big).toPromise();
            user = {...user, fontSize: FontSize.Big};
        }
        patchState({ user });
    }
}
