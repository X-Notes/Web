import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action, createSelector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api.service';
import { LoadPrivateNotes , AddNote, LoadFullNote, UpdateFullNote,
    LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes } from './notes-actions';
import { tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { type } from 'os';
import { patch, updateItem } from '@ngxs/store/operators';


interface NoteState {
    privateNotes: SmallNote[];
    sharedNotes: SmallNote[];
    deletedNotes: SmallNote[];
    archiveNotes: SmallNote[];
    fullNotes: FullNote[];
    privateLoaded: boolean;
    sharedLoaded: boolean;
    archiveLoaded: boolean;
    deletedLoaded: boolean;
    countPrivate: number;
    countShared: number;
    countDeleted: number;
    countArchive: number;
}

@State<NoteState>({
    name: 'Notes',
    defaults: {
        privateNotes: [],
        sharedNotes: [],
        deletedNotes: [],
        archiveNotes: [],
        fullNotes: [],
        privateLoaded: false,
        sharedLoaded: false,
        archiveLoaded: false,
        deletedLoaded: false,
        countPrivate: 0,
        countArchive: 0,
        countDeleted: 0,
        countShared: 0
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes) {
    }

    // Get notes
    @Selector()
    static privateNotes(state: NoteState): SmallNote[] {
        return state.privateNotes;
    }

    @Selector()
    static sharedNotes(state: NoteState): SmallNote[] {
        return state.sharedNotes;
    }

    @Selector()
    static deletedNotes(state: NoteState): SmallNote[] {
        return state.deletedNotes;
    }

    @Selector()
    static archiveNotes(state: NoteState): SmallNote[] {
        return state.archiveNotes;
    }

    // Get count notes
    @Selector()
    static privateCount(state: NoteState): number {
        return state.countPrivate;
    }

    @Selector()
    static archiveCount(state: NoteState): number {
        return state.countArchive;
    }

    @Selector()
    static deletedCount(state: NoteState): number {
        return state.countDeleted;
    }

    @Selector()
    static sharedCount(state: NoteState): number {
        return state.countShared;
    }


    // Get Full
    @Selector()
    static oneFull(state: NoteState) {
        return (id: string): FullNote => {
            return state.fullNotes.find(x => x.id === id);
        };
    }

    @Action(LoadPrivateNotes)
    loadPrivateNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().privateLoaded) {
        return this.api.getPrivateNotes().pipe(tap(content => { patchState({
             privateNotes: content ,
             privateLoaded: true,
             countPrivate: content.length
            }); }));
        }
    }

    @Action(LoadSharedNotes)
    loadSharedNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().sharedLoaded) {
        return this.api.getSharedNotes().pipe(tap(content => { patchState({
             sharedNotes: content ,
             sharedLoaded: true,
             countShared: content.length
            }); }));
        }
    }

    @Action(LoadArchiveNotes)
    loadArchiveNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().archiveLoaded) {
        return this.api.getArchiveNotes().pipe(tap(content => { patchState({
             archiveNotes: content ,
             archiveLoaded: true,
             countArchive: content.length
            }); }));
        }
    }

    @Action(LoadDeletedNotes)
    loadDeletedNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().deletedLoaded) {
        return this.api.getPrivateNotes().pipe(tap(content => { patchState({
             deletedNotes: content ,
             deletedLoaded: true,
             countDeleted: content.length
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
