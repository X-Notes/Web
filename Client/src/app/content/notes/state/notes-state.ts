import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action, createSelector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api.service';
import { LoadSmallNotes, AddNote, LoadFullNote, UpdateFullNote } from './notes-actions';
import { tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { type } from 'os';
import { patch, updateItem } from '@ngxs/store/operators';


interface NoteState {
    smallNotes: SmallNote[];
    fullNotes: FullNote[];
}

@State<NoteState>({
    name: 'Notes',
    defaults: {
        smallNotes: [],
        fullNotes: []
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
    static oneFull(state: NoteState) {
        return (id: string): FullNote => {
            return state.fullNotes.find(x => x.writeId === id);
        };
    }

    @Action(LoadSmallNotes)
    loadSmallNotes({ setState, getState, patchState }: StateContext<NoteState>) {
        if (getState().smallNotes.length === 0) {
        return this.api.getAll().pipe(tap(content => { patchState({ smallNotes: content }); }));
        }
    }

    @Action(AddNote)
    async newNote({ getState, patchState }: StateContext<NoteState>) {
        const id = await this.api.new().toPromise();
        const notes = getState().smallNotes;
        patchState({ smallNotes: [{id, order: 1, title: ''} , ...notes] });
    }


    @Action(LoadFullNote)
    async loadFull({ setState, getState, patchState }: StateContext<NoteState>, { id }: LoadFullNote) {
        const notes = getState().fullNotes;
        const noteExist = notes.find(x => x.writeId === id);
        if (!noteExist) {
            const note = await this.api.get(id).toPromise();
            patchState({fullNotes: [...notes , note]});
        }
    }

    @Action(UpdateFullNote)
    async updateLabels({ setState }: StateContext<NoteState>, { note }: UpdateFullNote) {
        setState(
            patch({
                fullNotes: updateItem<FullNote>(note2 => note2.writeId === note.writeId , note)
            })
        );
    }

}
