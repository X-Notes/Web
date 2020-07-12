import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api.service';
import { LoadSmallNotes, AddNote } from './notes-actions';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';


interface NoteState {
    smallNotes: SmallNote[];
    fullNote: FullNote;
}

@State<NoteState>({
    name: 'Notes',
    defaults: {
        smallNotes: [],
        fullNote: null
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes) {
    }

    @Selector()
    static allSmall(state: NoteState): SmallNote[] {
        return state.smallNotes;
    }

    @Selector()
    static oneFull(state: NoteState): FullNote {
        return state.fullNote;
    }

    @Action(LoadSmallNotes)
    loadSmallNotes({ setState, getState, patchState }: StateContext<NoteState>) {
        if (getState().smallNotes.length === 0) {
        return this.api.getAll().pipe(tap(content => { patchState({ smallNotes: content }); }));
        }
    }

    @Action(AddNote)
    async newNote({ setState, getState, patchState }: StateContext<NoteState>) {
        const id = await this.api.new().toPromise();
        const notes = getState().smallNotes;
        notes.unshift({id, order: 1, title: ''});
        patchState({ smallNotes: notes });
    }
}
