import { RoutePathes } from 'src/app/shared/enums/RoutePathes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { UpdateRoutePath, UpdateNoteType, UpdateFolderType } from './app-action';


interface AppState {
    routePath: RoutePathes;
    noteType: NoteType;
    folderType: FolderType;
}

@State<AppState>({
    name: 'App',
    defaults: {
        routePath: null,
        noteType: null,
        folderType: null,
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
    static getFolderType(state: AppState): FolderType {
        return state.folderType;
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
}
