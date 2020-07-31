import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action, createSelector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api.service';
import { LoadPrivateNotes as LoadPrivateNotes, AddNote, LoadFullNote, UpdateFullNote } from './notes-actions';
import { tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { type } from 'os';
import { patch, updateItem } from '@ngxs/store/operators';


interface NoteState {
    privateNotes: SmallNote[];
    fullNotes: FullNote[];
    privateLoaded: boolean;
    sharedLoaded: boolean;
    archiveLoaded: boolean;
    deletedLoaded: boolean;
}

@State<NoteState>({
    name: 'Notes',
    defaults: {
        privateNotes: [],
        fullNotes: [],
        privateLoaded: false,
        sharedLoaded: false,
        archiveLoaded: false,
        deletedLoaded: false
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes) {
    }

    @Selector()
    static privateNotes(state: NoteState): SmallNote[] {
        return state.privateNotes;
    }

    @Selector()
    static oneFull(state: NoteState) {
        return (id: string): FullNote => {
            return state.fullNotes.find(x => x.id === id);
        };
    }

    @Action(LoadPrivateNotes)
    loadPrivateNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().privateLoaded) {
        return this.api.getAll().pipe(tap(content => { patchState({
             privateNotes: content ,
             privateLoaded: true
            }); }));
        }
    }

    @Action(AddNote)
    async newNote({ getState, patchState }: StateContext<NoteState>) {
        const id = await this.api.new().toPromise();
        const notes = getState().privateNotes;
        patchState({ privateNotes: [{id, title: ''} , ...notes] });
    }


    @Action(LoadFullNote)
    async loadFull({ setState, getState, patchState }: StateContext<NoteState>, { id }: LoadFullNote) {
        const notes = getState().fullNotes;
        const noteExist = notes.find(x => x.id === id);
        if (!noteExist) {
            const note = await this.api.get(id).toPromise();
            patchState({fullNotes: [...notes , note]});
        }
    }

    @Action(UpdateFullNote)
    async updateLabels({ setState }: StateContext<NoteState>, { note }: UpdateFullNote) {
        setState(
            patch({
                fullNotes: updateItem<FullNote>(note2 => note2.id === note.id , note)
            })
        );
    }

}
