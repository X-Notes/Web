import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { UpdateRoute, SetToken, TokenSetNoUpdate, LoadGeneralEntites } from './app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { AppServiceAPI } from '../app.service';
import { LanguageDTO } from 'src/app/shared/models/LanguageDTO';
import { AuthService } from '../auth.service';
import { Theme } from 'src/app/shared/models/Theme';
import { FontSize } from 'src/app/shared/models/FontSize';
import { NoteType } from 'src/app/shared/models/noteType';
import { FolderType } from 'src/app/shared/models/folderType';
import { GeneralApp } from 'src/app/shared/models/generalApp';
import { EntityRef } from 'src/app/shared/models/entityRef';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';


interface AppState {
    routing: EntityType;
    token: string;
    tokenUpdated: boolean;
    generalApp: GeneralApp;
}

@State<AppState>({
    name: 'App',
    defaults: {
        routing: null,
        token: null,
        tokenUpdated: false,
        generalApp: null
    }
})
@Injectable()
export class AppStore {


    constructor(
        authService: AuthService, // DONT DELETE THIS ROW
        public appService: AppServiceAPI) {
    }

    @Selector()
    static getLanguages(state: AppState): LanguageDTO[] {
        return state.generalApp.languages;
    }

    @Selector()
    static getThemes(state: AppState): Theme[] {
        return state.generalApp.themes;
    }

    @Selector()
    static getFontSizes(state: AppState): FontSize[] {
        return state.generalApp.fontSizes;
    }

    @Selector()
    static getNoteTypes(state: AppState): NoteType[] {
        return state.generalApp.noteTypes;
    }

    @Selector()
    static getFolderTypes(state: AppState): FolderType[] {
        return state.generalApp.folderTypes;
    }

    @Selector()
    static getRefs(state: AppState): EntityRef[] {
        return state.generalApp.refs;
    }

    @Selector()
    static getToken(state: AppState): string {
        return state.token;
    }

    @Selector()
    static appLoaded(state: AppState): boolean {
        return state.tokenUpdated && state.generalApp !== null;
    }

    @Selector()
    static isFolderInner(state: AppState): boolean {
        return state.routing === EntityType.FolderInner;
    }

    @Selector()
    static isNoteInner(state: AppState): boolean {
        return state.routing === EntityType.NoteInner;
    }

    @Selector()
    static isFolder(state: AppState): boolean {
        return state.routing === EntityType.FolderShared ||
        state.routing === EntityType.FolderDeleted ||
        state.routing === EntityType.FolderPrivate ||
        state.routing === EntityType.FolderArchive ||
        state.routing === EntityType.FolderInner;
    }

    @Selector()
    static isNote(state: AppState): boolean {
        return state.routing === EntityType.NoteShared ||
        state.routing === EntityType.NoteDeleted ||
        state.routing === EntityType.NotePrivate ||
        state.routing === EntityType.NoteArchive ||
        state.routing === EntityType.NoteInner;
    }

    @Selector()
    static isDelete(state: AppState): boolean {
        return state.routing === EntityType.NoteDeleted ||
        state.routing === EntityType.FolderDeleted;
    }

    @Selector()
    static isProfile(state: AppState): boolean {
        return state.routing === EntityType.Profile;
    }

    @Selector()
    static getName(state: AppState): string {
        switch (state.routing) {

            case EntityType.FolderPrivate: {
                return 'folder';
            }
            case EntityType.FolderShared: {
                return 'folder';
            }
            case EntityType.FolderDeleted: {
                return 'folder';
            }
            case EntityType.FolderArchive: {
                return 'folder';
            }

            case EntityType.NotePrivate: {
                return 'note';
            }
            case EntityType.NoteArchive: {
                return 'note';
            }
            case EntityType.NoteDeleted: {
                return 'note';
            }
            case EntityType.NoteShared: {
                return 'note';
            }

            case EntityType.LabelPrivate: {
                return 'label';
            }
            case EntityType.LabelDeleted: {
                return 'label';
            }

            case EntityType.Profile: {
                return 'background';
            }
        }
    }

    @Selector()
    static getRouting(state: AppState): EntityType {
        return state.routing;
    }


    @Selector()
    static getTypeNote(state: AppState): NoteTypeENUM {
        switch (state.routing) {
            case EntityType.NotePrivate: {
                return NoteTypeENUM.Private;
            }
            case EntityType.NoteArchive: {
                return NoteTypeENUM.Archive;
            }
            case EntityType.NoteDeleted: {
                return NoteTypeENUM.Deleted;
            }
            case EntityType.NoteShared: {
                return NoteTypeENUM.Shared;
            }
            default: {
                throw new Error('Incorrect type');
            }
        }
    }

    @Selector()
    static getTypeFolder(state: AppState): FolderTypeENUM {
        switch (state.routing) {

            case EntityType.FolderPrivate: {
                return FolderTypeENUM.Private;
            }
            case EntityType.FolderShared: {
                return FolderTypeENUM.Shared;
            }
            case EntityType.FolderDeleted: {
                return FolderTypeENUM.Deleted;
            }
            case EntityType.FolderArchive: {
                return FolderTypeENUM.Archive;
            }
            default: {
                throw new Error('Incorrect type');
            }
        }
    }

    // UPPER MENU SELECTORS

    @Selector()
    static getNewButtonActive(state: AppState): boolean {
        return !this.isNoteInner(state) &&
        !this.isFolderInner(state) &&
        state.routing !== EntityType.LabelDeleted &&
        state.routing !== null;
    }

    @Action(UpdateRoute)
    async updateRoute({patchState}: StateContext<AppState>, {type}: UpdateRoute) {
        patchState({routing: type});
    }

    @Action(SetToken)
    setToken({ patchState }: StateContext<AppState>, { token }: SetToken) {
        patchState({ token, tokenUpdated: true });
    }

    @Action(TokenSetNoUpdate)
    setNoUpdateToken({ patchState }: StateContext<AppState>) {
        patchState({  token: null , tokenUpdated: false });
    }

    @Action(LoadGeneralEntites)
    async loadGeneralEntites({ patchState }: StateContext<AppState>) {
        const general = await this.appService.getLoadGeneral().toPromise();
        patchState({  generalApp: general });
    }

}
