import { FullNote } from '../models/fullNote';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { LoadFullNote, DeleteCurrentNote, UpdateTitle } from './full-note-actions';
import { ApiServiceNotes } from '../api-notes.service';
import { AccessType } from '../models/accessType';



interface FullNoteState {
    currentFullNote: FullNote;
    canView: boolean;
    accessType: AccessType;
}

@State<FullNoteState>({
    name: 'FullNote',
    defaults: {
        canView: false,
        currentFullNote: null,
        accessType: null
    }
})

@Injectable()
export class FullNoteStore {

    constructor(private api: ApiServiceNotes) {
    }

    @Selector()
    static oneFull(state: FullNoteState): FullNote {
        return state.currentFullNote;
    }


    @Selector()
    static canView(state: FullNoteState): boolean {
        return state.canView;
    }

    @Selector()
    static canNoView(state: FullNoteState): boolean {
        return !state.canView;
    }

    @Action(LoadFullNote)
    async loadFull({ setState, getState, patchState }: StateContext<FullNoteState>, { id }: LoadFullNote) {
        const request = await this.api.get(id).toPromise();
        patchState({ currentFullNote: request.fullNote, canView: request.canView, accessType: request.accessType });
    }

    @Action(DeleteCurrentNote)
    deleteCurrentNote({ setState, getState, patchState }: StateContext<FullNoteState>) {
        patchState({ currentFullNote: null });
    }


    @Action(UpdateTitle)
    async updateTitle({ getState, patchState }: StateContext<FullNoteState>, { str }: UpdateTitle) {
        const note = getState().currentFullNote;
        patchState(
            {
                currentFullNote: { ...note, title: str }
            });
        await this.api.updateTitle(str, note.id).toPromise();
    }
}
