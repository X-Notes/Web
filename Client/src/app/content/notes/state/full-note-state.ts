import { FullNote } from '../models/fullNote';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { LoadFullNote, DeleteCurrentNote } from './full-note-actions';
import { ApiServiceNotes } from '../api-notes.service';



interface FullNoteState {
    currentFullNote: FullNote;
}

@State<FullNoteState>({
    name: 'FullNote',
    defaults: {
        currentFullNote: null
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

    @Action(LoadFullNote)
    async loadFull({ setState, getState, patchState }: StateContext<FullNoteState>, { id }: LoadFullNote) {
        const note = await this.api.get(id).toPromise();
        patchState({ currentFullNote: note });
    }

    @Action(DeleteCurrentNote)
    deleteCurrentNote({ setState, getState, patchState }: StateContext<FullNoteState>) {
        patchState({currentFullNote: null});
    }
}
