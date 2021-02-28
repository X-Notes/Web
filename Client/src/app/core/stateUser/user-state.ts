import { ShortUser } from 'src/app/core/models/short-user';
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { UserAPIService } from '../user-api.service';
import { Login, Logout, ChangeTheme, ChangeLanguage,
    ChangeFontSize,
    SetCurrentBackground,
    SetDefaultBackground, UpdateUserName, UpdateUserPhoto  } from './user-action';
import { Theme } from 'src/app/shared/models/Theme';
import { LanguageDTO } from 'src/app/shared/models/LanguageDTO';
import { TranslateService } from '@ngx-translate/core';
import { FontSize } from 'src/app/shared/models/FontSize';
import { BackgroundService } from 'src/app/content/profile/background.service';
import { SetToken, TokenSetNoUpdate } from '../stateApp/app-action';
import { environment } from 'src/environments/environment';

interface UserState {
    user: ShortUser;
    isLogin: boolean;
}

@State<UserState>({
    name: 'User',
    defaults: {
        user: null,
        isLogin: false
    }
})

@Injectable()
export class UserStore {

    constructor(private api: UserAPIService,
                private translateService: TranslateService,
                private backgroundAPI: BackgroundService) {

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
    static getUserTheme(state: UserState): Theme {
        return state.user.theme;
    }

    @Selector()
    static getUserBackground(state: UserState): string {
        const path = state.user.currentBackground?.path;
        if (path)
        {
            return environment.writeAPI + `/api/Files/image/${path}`;
        }
        return null;
    }


    @Selector()
    static getUserFontSize(state: UserState): FontSize {
        return state.user.fontSize;
    }

    @Selector()
    static getUserLanguage(state: UserState): LanguageDTO {
        return state.user.language;
    }


    @Action(Login)
    async login({ setState, dispatch }: StateContext<UserState>, { token, user }: Login) {
        let userdb = await this.api.getUser().toPromise();
        if (userdb === null) {
            userdb = await this.api.newUser(user).toPromise();
            dispatch(new UpdateUserPhoto(user.photo));
        }
        dispatch(new SetToken(token));
        setState({ user: userdb, isLogin: true});
    }

    @Action(Logout)
    logout({ setState, dispatch }: StateContext<UserState>) {
        dispatch(new TokenSetNoUpdate());
        setState({ user: null, isLogin: false });
    }



    @Action(ChangeTheme)
    async changeTheme({ patchState, getState }: StateContext<UserState>, {theme}: ChangeTheme) {
        let user = getState().user;
        await this.api.changeTheme(theme.id).toPromise();
        user = {...user, theme};
        patchState({ user });
    }

    @Action(ChangeLanguage)
    async changeLanguage({ patchState, getState }: StateContext<UserState>, {language}: ChangeLanguage ) {
        await this.api.changeLanguage(language.id).toPromise();
        await this.translateService.use(language.name).toPromise();
        patchState({ user: {...getState().user, language}});
    }

    @Action(ChangeFontSize)
    async changeFontSize({ patchState, getState }: StateContext<UserState>, {fontSize}: ChangeFontSize) {
        let user = getState().user;
        await this.api.changeFontSize(fontSize.id).toPromise();
        user = {...user, fontSize};
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
        const newPhoto = await this.api.updateUserPhoto(photo).toPromise();
        patchState({
            user: {...getState().user, photoId: newPhoto.id}
        });
    }
}
