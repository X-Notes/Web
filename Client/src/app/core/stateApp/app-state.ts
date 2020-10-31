import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { UpdateRoute, UpdateMenuActive, UpdateSelectAllButton,
    UpdateNewButton, UpdateSettingsButton, UpdateRouteWithNoteType,
    UpdateDefaultBackgroundButton, UpdateButtonRemoveAllLabels, SpinnerChangeStatus } from './app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';


interface AppState {
    routing: EntityType;
    newButtonActive: boolean;
    selectAllButtonActive: boolean;
    menuActive: boolean;
    settingsButtonActive: boolean;
    buttonRemoveAllLabels: boolean;
    innerNoteType: NoteType;
    defaultBackground: boolean;
    spinnerActive: boolean;
}

@State<AppState>({
    name: 'App',
    defaults: {
        routing: null,
        newButtonActive: false,
        selectAllButtonActive: false,
        settingsButtonActive: false,
        buttonRemoveAllLabels: false,
        menuActive: false,
        innerNoteType: null,
        defaultBackground: false,
        spinnerActive: false
    }
})
@Injectable()
export class AppStore {

    @Selector()
    static isNoteInner(state: AppState): boolean {
        return state.routing === EntityType.NoteInner;
    }

    @Selector()
    static spinnerActive(state: AppState): boolean {
        console.log(state.spinnerActive);
        return state.spinnerActive;
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
    static getInnerNoteType(state: AppState): NoteType {
        return state.innerNoteType;
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

    @Selector()
    static getdefaultBackground(state: AppState): boolean {
        return state.defaultBackground;
    }

    @Action(UpdateRoute)
    async updateRoute({patchState}: StateContext<AppState>, {type}: UpdateRoute) {
        patchState({routing: type});
    }

    @Action(UpdateRouteWithNoteType)
    async updateRouteWithNoteType({patchState}: StateContext<AppState>, {type, noteType}: UpdateRouteWithNoteType) {
        patchState({routing: type, innerNoteType: noteType});
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

    @Action(UpdateButtonRemoveAllLabels)
    updateRemoveAllLabelsButton({patchState}: StateContext<AppState>, {flag}: UpdateButtonRemoveAllLabels) {
        patchState({buttonRemoveAllLabels: flag});
    }

    @Action(UpdateDefaultBackgroundButton)
    updateDefaultBackground({patchState}: StateContext<AppState>, {flag}: UpdateSelectAllButton) {
        patchState({defaultBackground: flag});
    }

    @Action(UpdateMenuActive)
    updateMenu({patchState}: StateContext<AppState>, {flag}: UpdateMenuActive) {
        patchState({menuActive: flag});
    }

    @Action(SpinnerChangeStatus)
    spinnerChangeStatus({patchState}: StateContext<AppState>, {flag}: SpinnerChangeStatus) {
        patchState({spinnerActive: flag});
    }
}
