import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api.service';
import { LoadPrivateNotes , AddNote, LoadFullNote, UpdateFullNote,
    LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes, LoadAllNotes, ChangeColorNote, SelectIdNote,
    UnSelectIdNote, UnSelectAllNote, SelectAllNote, UpdateSmallNote, ClearColorNotes, SetDeleteNotes,
    SetDeleteNotesClear, DeleteNotesPermanently, DeleteNotesPermanentlyClear} from './notes-actions';
import { tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { type } from 'os';
import { patch, updateItem} from '@ngxs/store/operators';
import { NoteColorPallete } from 'src/app/shared/enums/NoteColors';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { stat } from 'fs';
import { UpdateColorNote } from './updateColor';


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
    selectedIds: string[];
    updateColor: UpdateColorNote[];
    setdeleteNotesEvent: SmallNote[];
    deleteParmanently: string[];
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
        countShared: 0,
        selectedIds: [],
        updateColor: [],
        setdeleteNotesEvent: [],
        deleteParmanently: []
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes) {
    }


    @Selector()
    static deleteParmanently(state: NoteState): string[] {
        return state.deleteParmanently;
    }

    @Selector()
    static setdeleteNotesEvent(state: NoteState): SmallNote[] {
        return state.setdeleteNotesEvent;
    }

    @Selector()
    static updateColor(state: NoteState): UpdateColorNote[] {
        return state.updateColor;
    }

    @Selector()
    static selectedIds(state: NoteState): string[] {
        return state.selectedIds;
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
        return this.api.getDeletedNotes().pipe(tap(content => { patchState({
             deletedNotes: content ,
             deletedLoaded: true,
             countDeleted: content.length
            }); }));
        }
    }

    @Action(LoadAllNotes)
    async loadAllNotes({ dispatch }: StateContext<NoteState>) {
        dispatch([LoadPrivateNotes, LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes]);
    }

    @Action(AddNote)
    async newNote({ getState, patchState }: StateContext<NoteState>) {
        const id = await this.api.new().toPromise();
        const notes = getState().privateNotes;
        patchState({
            privateNotes: [{id, title: '', color: NoteColorPallete.Green } , ...notes],
            countPrivate: getState().countPrivate + 1
        });
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
    async updateFullNote({ setState }: StateContext<NoteState>, { note }: UpdateFullNote) {
        setState(
            patch({
                fullNotes: updateItem<FullNote>(note2 => note2.id === note.id , note)
            })
        );
    }

    @Action(UpdateSmallNote)
    async updateSmallNote({ setState }: StateContext<NoteState>, { note, typeNote }: UpdateSmallNote) {
        switch (typeNote) {
            case NoteType.Archive : {
                setState(
                    patch({
                        archiveNotes: updateItem<SmallNote>(note2 => note2.id === note.id , note)
                    })
                );
                break;
            }
            case NoteType.Private : {
                setState(
                    patch({
                        privateNotes: updateItem<SmallNote>(note2 => note2.id === note.id , note)
                    })
                );
                break;
            }
            case NoteType.Shared : {
                setState(
                    patch({
                        sharedNotes: updateItem<SmallNote>(note2 => note2.id === note.id , note)
                    })
                );
                break;
            }
            case NoteType.Deleted : {
                setState(
                    patch({
                        deletedNotes: updateItem<SmallNote>(note2 => note2.id === note.id , note)
                    })
                );
                break;
            }
        }
    }

    // FUNCTION UPPER MENU
    @Action(ChangeColorNote)
    async changeColor({patchState, getState, dispatch}: StateContext<NoteState>, {color, typeNote}: ChangeColorNote) {

        const selectedIds = getState().selectedIds;
        await this.api.changeColor(selectedIds, color).toPromise();
        let notes: SmallNote[];
        switch (typeNote) {
            case NoteType.Archive : {
                notes = getState().archiveNotes.filter(x => selectedIds.some(z => z === x.id))
                .map(note => { note = {...note}; return note; });
                break;
            }
            case NoteType.Private : {
                notes = getState().privateNotes.filter(x => selectedIds.some(z => z === x.id))
                .map(note => { note = {...note}; return note; });
                break;
            }
            case NoteType.Deleted : {
                notes = getState().deletedNotes.filter(x => selectedIds.some(z => z === x.id))
                .map(note => { note = {...note}; return note; });
                break;
            }
            case NoteType.Shared : {
                notes = getState().sharedNotes.filter(x => selectedIds.some(z => z === x.id))
                .map(note => { note = {...note}; return note; });
                break;
            }
        }
        notes.forEach(z => z.color = color);
        notes.forEach(note => dispatch(new UpdateSmallNote(note, typeNote)));
        const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
        patchState({updateColor});
        dispatch([UnSelectAllNote, ClearColorNotes]);
    }

    mapFromNoteToUpdateColor(note: SmallNote) {
        const obj: UpdateColorNote = {
            id: note.id,
            color: note.color
        };
        return obj;
    }

    @Action(ClearColorNotes)
    clearColorNotes({patchState}: StateContext<NoteState>) {
        patchState({updateColor: []});
    }



    @Action(SetDeleteNotes)
    async deleteNotes({getState, dispatch, patchState}: StateContext<NoteState>, {typeNote}: SetDeleteNotes) {
        const selectedIds = getState().selectedIds;
        await this.api.setDeleteNotes(selectedIds, typeNote).toPromise();

        let notes;
        switch (typeNote) {
            case NoteType.Archive : {
                notes = getState().archiveNotes.filter(x => selectedIds.some(z => z === x.id));
                break;
            }
            case NoteType.Private : {
                notes = getState().privateNotes.filter(x => selectedIds.some(z => selectedIds.indexOf(x.id) !== -1 ? false : true));
                const deletedNotes = getState().privateNotes.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    privateNotes: notes,
                    deletedNotes: [...deletedNotes , ...getState().deletedNotes],
                    countPrivate: notes.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    setdeleteNotesEvent: [...deletedNotes]
                });
                break;
            }
            case NoteType.Deleted : {
                notes = getState().deletedNotes.filter(x => selectedIds.some(z => z === x.id));
                break;
            }
            case NoteType.Shared : {
                notes = getState().sharedNotes.filter(x => selectedIds.some(z => z === x.id));
                break;
            }
        }

        dispatch([UnSelectAllNote]);
    }

    @Action(SetDeleteNotesClear)
    setDeleteNotesClear({patchState}: StateContext<NoteState>) {
        patchState({setdeleteNotesEvent: []});
    }

    @Action(DeleteNotesPermanently)
    async deleteNotesPermanently({getState, dispatch, patchState}: StateContext<NoteState>) {
        const selectedIds = getState().selectedIds;
        await this.api.deleteNotes(selectedIds).toPromise();
        patchState({
            deleteParmanently: [...selectedIds],
            countDeleted: getState().countDeleted - selectedIds.length
        });
        dispatch([UnSelectAllNote, DeleteNotesPermanentlyClear]);
    }

    @Action(DeleteNotesPermanentlyClear)
    clearDeleteNotesPermanentlyClear({getState, dispatch, patchState}: StateContext<NoteState>) {
        patchState({
            deleteParmanently: [],
        });
    }

    // NOTES SELECTION
    @Action(SelectIdNote)
    select({patchState, getState}: StateContext<NoteState>, {id}: SelectIdNote) {
        const ids = getState().selectedIds;
        patchState({selectedIds: [id , ...ids]});
    }

    @Action(UnSelectIdNote)
    unSelect({getState, patchState}: StateContext<NoteState>, {id}: UnSelectIdNote) {
        let ids = getState().selectedIds;
        ids = ids.filter(x => x !== id);
        patchState({selectedIds: [...ids]});
    }

    @Action(UnSelectAllNote)
    unselectAll({patchState, getState}: StateContext<NoteState>) {
        patchState({selectedIds: []});
    }

    @Action(SelectAllNote)
    selectAll({patchState, getState}: StateContext<NoteState>, {typeNote}: SelectAllNote) {
        let ids;
        switch (typeNote) {
            case NoteType.Archive : {
                ids = getState().archiveNotes.map(x => x.id);
                break;
            }
            case NoteType.Private : {
                ids = getState().privateNotes.map(x => x.id);
                break;
            }
            case NoteType.Deleted : {
                ids = getState().deletedNotes.map(x => x.id);
                break;
            }
            case NoteType.Shared : {
                ids = getState().sharedNotes.map(x => x.id);
                break;
            }
        }
        patchState({selectedIds: [...ids]});
    }
}
