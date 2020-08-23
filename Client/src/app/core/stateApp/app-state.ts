import { RoutePathes } from 'src/app/shared/enums/RoutePathes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { UpdateRoutePath, UpdateNoteType, UpdateFolderType, UpdateRoute,
    UpdateMenuActive, UpdateSelectAllButton, UpdateNewButton, UpdateSettingsButton } from './app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';


interface AppState {
    routePath: RoutePathes;
    noteType: NoteType;
    folderType: FolderType;
    routing: EntityType;
    newButtonActive: boolean;
    selectAllButtonActive: boolean;
    menuActive: boolean;
    settingsButtonActive: boolean;
}

@State<AppState>({
    name: 'App',
    defaults: {
        routePath: null,
        noteType: null,
        folderType: null,
        routing: null,
        newButtonActive: true,
        selectAllButtonActive: true,
        settingsButtonActive: true,
        menuActive: false,
    }
})
@Injectable()
export class AppStore {

    @Selector()
    static getRoutePath(state: AppState): RoutePathes {
        return state.routePath;
    }

    @Selector()
    static getNoteType(state: AppState): NoteType {
        return state.noteType;
    }

    @Selector()
    static isNoteInner(state: AppState): boolean {
        return state.routing === EntityType.NoteInner;
    }

    @Selector()
    static getFolderType(state: AppState): FolderType {
        return state.folderType;
    }

    @Selector()
    static getRouting(state: AppState): EntityType {
        return state.routing;
    }

    // UPPER MENU SELECTORS

    @Selector()
    static getNewButtonActive(state: AppState): boolean {
        return state.newButtonActive;
    }

    @Selector()
    static getSettingsButtonActive(state: AppState): boolean {
        return state.settingsButtonActive;
    }

    @Selector()
    static getSelectAllButtonActive(state: AppState): boolean {
        return state.selectAllButtonActive;
    }

    @Selector()
    static getMenuActive(state: AppState): boolean {
        return state.menuActive;
    }


    @Action(UpdateRoutePath)
    updateRoutePath({patchState}: StateContext<AppState>, {routePath}: UpdateRoutePath) {
        patchState({routePath});
    }

    @Action(UpdateNoteType)
    updateNoteType({patchState}: StateContext<AppState>, {typeNote}: UpdateNoteType) {
        patchState({noteType: typeNote});
    }

    @Action(UpdateFolderType)
    updateFolderType({patchState}: StateContext<AppState>, {typeFolder}: UpdateFolderType) {
        patchState({folderType: typeFolder});
    }

    @Action(UpdateRoute)
    updateRoute({patchState}: StateContext<AppState>, {type}: UpdateRoute) {
        patchState({routing: type});
    }

    // UPPER MENU BUTTONS
    @Action(UpdateSettingsButton)
    updateSettings({patchState}: StateContext<AppState>, {flag}: UpdateSettingsButton) {
        patchState({settingsButtonActive: flag});
    }

    @Action(UpdateNewButton)
    updateNew({patchState}: StateContext<AppState>, {flag}: UpdateNewButton) {
        patchState({newButtonActive: flag});
    }

    @Action(UpdateSelectAllButton)
    updateSelectAll({patchState}: StateContext<AppState>, {flag}: UpdateSelectAllButton) {
        patchState({selectAllButtonActive: flag});
    }

    @Action(UpdateMenuActive)
    updateMenu({patchState}: StateContext<AppState>, {flag}: UpdateMenuActive) {
        patchState({menuActive: flag});
    }
}
