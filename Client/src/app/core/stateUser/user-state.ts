import { ShortUser } from 'src/app/core/models/short-user';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { UserAPIService } from '../user-api.service';
import { Login, Logout, SetToken, TokenSetNoUpdate, ChangeTheme, ChangeLanguage,
    ChangeFontSize,
    SetCurrentBackground,
    SetDefaultBackground, UpdateUserName, UpdateUserPhoto  } from './user-action';
import { Theme } from 'src/app/shared/enums/Theme';
import { Language } from 'src/app/shared/enums/Language';
import { TranslateService } from '@ngx-translate/core';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { Background } from '../models/background';
import { BackgroundService } from 'src/app/content/profile/background.service';

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
        tokenUpdated: false,
    }
})

@Injectable()
export class UserStore {

    constructor(private api: UserAPIService,
                private translateService: TranslateService,
                private backgroundAPI: BackgroundService) {

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
            user.photoId = await this.api.getImageFromGoogle(user.photoId);
            userdb = await this.api.newUser(user).toPromise();
        }
        setState({ user: userdb, isLogin: true, token, tokenUpdated: true});
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

    @Action(SetCurrentBackground)
    setCurrent({ patchState, getState }: StateContext<UserState>, {background}: SetCurrentBackground) {
        patchState({ user: {...getState().user, currentBackground: background } });
    }

    @Action(SetDefaultBackground)
    async setDefault({ patchState, getState }: StateContext<UserState>) {
        await this.backgroundAPI.defaultBackground().toPromise();
        patchState({
            user: {...getState().user, currentBackground: null}
        });
    }

    @Action(UpdateUserName)
    async updateUserName({ patchState, getState }: StateContext<UserState>, {newName}: UpdateUserName) {
        await this.api.updateUserName(newName).toPromise();
        patchState({
            user: {...getState().user, name: newName}
        });
    }

    @Action(UpdateUserPhoto)
    async updateUserPhoto({ patchState, getState }: StateContext<UserState>, {photo}: UpdateUserPhoto) {
        let newPhoto = await this.api.updateUserPhoto(photo).toPromise();
        newPhoto = newPhoto.url;
        patchState({
            user: {...getState().user, photoId: newPhoto}
        });
    }
}
