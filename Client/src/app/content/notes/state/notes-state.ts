import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api-notes.service';
import {
    LoadPrivateNotes, AddNote, LoadFullNote, UpdateFullNote,
    LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes, LoadAllNotes, ChangeColorNote, SelectIdNote,
    UnSelectIdNote, UnSelectAllNote, SelectAllNote, UpdateSmallNote, ClearColorNotes, SetDeleteNotes
    , DeleteNotesPermanently, RestoreNotes, ArchiveNotes,
    RemoveFromDomMurri, MakePublicNotes, MakePrivateNotes, CopyNotes, ClearAddedPrivateNotes, PositionNote
} from './notes-actions';
import { tap } from 'rxjs/operators';
import { patch, updateItem } from '@ngxs/store/operators';
import { NoteColorPallete } from 'src/app/shared/enums/NoteColors';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UpdateColor } from './updateColor';
import { OrderService } from 'src/app/shared/services/order.service';


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
    updateColorEvent: UpdateColor[];
    removeFromMurriEvent: string[];
    notesAddingPrivate: SmallNote[];
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
        updateColorEvent: [],
        removeFromMurriEvent: [],
        notesAddingPrivate: []
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes,
                private orderService: OrderService) {
    }

    @Selector()
    static notesAddingPrivate(state: NoteState): SmallNote[] {
        return state.notesAddingPrivate;
    }

    @Selector()
    static removeFromMurriEvent(state: NoteState): string[] {
        return state.removeFromMurriEvent;
    }

    @Selector()
    static updateColorEvent(state: NoteState): UpdateColor[] {
        return state.updateColorEvent;
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
            return this.api.getPrivateNotes().pipe(tap(content => {
                patchState({
                    privateNotes: content,
                    privateLoaded: true,
                    countPrivate: content.length
                });
            }));
        }
    }

    @Action(LoadSharedNotes)
    loadSharedNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().sharedLoaded) {
            return this.api.getSharedNotes().pipe(tap(content => {
                patchState({
                    sharedNotes: content,
                    sharedLoaded: true,
                    countShared: content.length
                });
            }));
        }
    }

    @Action(LoadArchiveNotes)
    loadArchiveNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().archiveLoaded) {
            return this.api.getArchiveNotes().pipe(tap(content => {
                patchState({
                    archiveNotes: content,
                    archiveLoaded: true,
                    countArchive: content.length
                });
            }));
        }
    }

    @Action(LoadDeletedNotes)
    loadDeletedNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().deletedLoaded) {
            return this.api.getDeletedNotes().pipe(tap(content => {
                patchState({
                    deletedNotes: content,
                    deletedLoaded: true,
                    countDeleted: content.length
                });
            }));
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
            privateNotes: [{ id, title: '', color: NoteColorPallete.Green }, ...notes],
            countPrivate: getState().countPrivate + 1
        });
    }


    @Action(LoadFullNote)
    async loadFull({ setState, getState, patchState }: StateContext<NoteState>, { id }: LoadFullNote) {
        const notes = getState().fullNotes;
        const noteExist = notes.find(x => x.id === id);
        if (!noteExist) {
            const note = await this.api.get(id).toPromise();
            patchState({ fullNotes: [...notes, note] });
        }
    }

    @Action(UpdateFullNote)
    async updateFullNote({ setState }: StateContext<NoteState>, { note }: UpdateFullNote) {
        setState(
            patch({
                fullNotes: updateItem<FullNote>(note2 => note2.id === note.id, note)
            })
        );
    }

    @Action(UpdateSmallNote)
    async updateSmallNote({ setState }: StateContext<NoteState>, { note, typeNote }: UpdateSmallNote) {
        switch (typeNote) {
            case NoteType.Archive: {
                setState(
                    patch({
                        archiveNotes: updateItem<SmallNote>(note2 => note2.id === note.id, note)
                    })
                );
                break;
            }
            case NoteType.Private: {
                setState(
                    patch({
                        privateNotes: updateItem<SmallNote>(note2 => note2.id === note.id, note)
                    })
                );
                break;
            }
            case NoteType.Shared: {
                setState(
                    patch({
                        sharedNotes: updateItem<SmallNote>(note2 => note2.id === note.id, note)
                    })
                );
                break;
            }
            case NoteType.Deleted: {
                setState(
                    patch({
                        deletedNotes: updateItem<SmallNote>(note2 => note2.id === note.id, note)
                    })
                );
                break;
            }
        }
    }

    // FUNCTION UPPER MENU


    // Color change
    @Action(ChangeColorNote)
    async changeColor({ patchState, getState, dispatch }: StateContext<NoteState>, { color, typeNote }: ChangeColorNote) {

        const selectedIds = getState().selectedIds;
        await this.api.changeColor(selectedIds, color).toPromise();
        let notes: SmallNote[];
        switch (typeNote) {
            case NoteType.Archive: {
                notes = getState().archiveNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });
                break;
            }
            case NoteType.Private: {
                notes = getState().privateNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });
                break;
            }
            case NoteType.Deleted: {
                notes = getState().deletedNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });
                break;
            }
            case NoteType.Shared: {
                notes = getState().sharedNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });
                break;
            }
        }
        notes.forEach(z => z.color = color);
        notes.forEach(note => dispatch(new UpdateSmallNote(note, typeNote)));
        const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
        patchState({ updateColorEvent: updateColor });
        dispatch([UnSelectAllNote, ClearColorNotes]);
    }

    mapFromNoteToUpdateColor(note: SmallNote) {
        const obj: UpdateColor = {
            id: note.id,
            color: note.color
        };
        return obj;
    }

    @Action(ClearColorNotes)
    clearColorNotes({ patchState }: StateContext<NoteState>) {
        patchState({ updateColorEvent: [] });
    }


    // Set deleting
    @Action(SetDeleteNotes)
    async deleteNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote }: SetDeleteNotes) {
        const selectedIds = getState().selectedIds;
        await this.api.setDeleteNotes(selectedIds, typeNote).toPromise();

        let notes;
        switch (typeNote) {
            case NoteType.Archive: {
                notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const deletedNotes = getState().archiveNotes.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    archiveNotes: notes,
                    deletedNotes: [...deletedNotes, ...getState().deletedNotes],
                    countArchive: notes.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds]
                });
                break;
            }
            case NoteType.Private: {
                notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const deletedNotes = getState().privateNotes.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    privateNotes: notes,
                    deletedNotes: [...deletedNotes, ...getState().deletedNotes],
                    countPrivate: notes.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds]
                });
                break;
            }
            case NoteType.Shared: {
                notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const deletedNotes = getState().sharedNotes.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    sharedNotes: notes,
                    deletedNotes: [...deletedNotes, ...getState().deletedNotes],
                    countShared: notes.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds]
                });
                break;
            }
        }
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }

    // Deleting
    @Action(DeleteNotesPermanently)
    async deleteNotesPermanently({ getState, dispatch, patchState }: StateContext<NoteState>) {
        const selectedIds = getState().selectedIds;
        await this.api.deleteNotes(selectedIds).toPromise();
        patchState({
            removeFromMurriEvent: [...selectedIds],
            countDeleted: getState().countDeleted - selectedIds.length
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }

    // Restoring
    @Action(RestoreNotes)
    async restoreNotes({ getState, patchState, dispatch }: StateContext<NoteState>) {
        const selectedIds = getState().selectedIds;
        await this.api.restoreNotes(selectedIds).toPromise();
        const deletednotes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
        const addToPrivatenotes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
        patchState({
            deletedNotes: [...deletednotes],
            countDeleted: deletednotes.length,
            countPrivate: getState().countPrivate + addToPrivatenotes.length,
            privateNotes: [...addToPrivatenotes, ...getState().privateNotes],
            removeFromMurriEvent: [...selectedIds]
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }

    // Archive
    @Action(ArchiveNotes)
    async archiveNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: ArchiveNotes) {
        const selectedIds = getState().selectedIds;
        await this.api.archiveNotes(selectedIds, typeNote).toPromise();

        switch (typeNote) {
            case NoteType.Deleted: {
                const notesDeleted = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countDeleted: getState().countDeleted - selectedIds.length,
                    countArchive: getState().countArchive + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    deletedNotes: [...notesDeleted],
                    archiveNotes: [...notesAdded, ...getState().archiveNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
            case NoteType.Private: {
                const notesPrivate = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countPrivate: getState().countPrivate - selectedIds.length,
                    countArchive: getState().countArchive + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    privateNotes: [...notesPrivate],
                    archiveNotes: [...notesAdded, ...getState().archiveNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
            case NoteType.Shared: {
                const notesShared = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countShared: getState().countShared - selectedIds.length,
                    countArchive: getState().countArchive + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    sharedNotes: [...notesShared],
                    archiveNotes: [...notesAdded, ...getState().archiveNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
        }
    }

    @Action(MakePublicNotes)
    async makePublicNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePublicNotes) {
        const selectedIds = getState().selectedIds;
        await this.api.makePublicNotes(selectedIds, typeNote).toPromise();

        switch (typeNote) {
            case NoteType.Private: {
                const notePrivate = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countPrivate: getState().countPrivate - selectedIds.length,
                    countShared: getState().countShared + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    privateNotes: [...notePrivate],
                    sharedNotes: [...notesAdded, ...getState().sharedNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
            case NoteType.Archive: {
                const noteArchive = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countArchive: getState().countArchive - selectedIds.length,
                    countShared: getState().countShared + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    archiveNotes: [...noteArchive],
                    sharedNotes: [...notesAdded, ...getState().sharedNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
        }
    }

    @Action(MakePrivateNotes)
    async makePrivateNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePrivateNotes) {
        const selectedIds = getState().selectedIds;
        await this.api.makePrivateNotes(selectedIds, typeNote).toPromise();

        switch (typeNote) {
            case NoteType.Archive: {
                const notesArchive = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countArchive: getState().countArchive - selectedIds.length,
                    countPrivate: getState().countPrivate + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    archiveNotes: [...notesArchive],
                    privateNotes: [...notesAdded, ...getState().privateNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
            case NoteType.Shared: {
                const notesShared = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const notesAdded = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countShared: getState().countShared - selectedIds.length,
                    countPrivate: getState().countPrivate + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    sharedNotes: [...notesShared],
                    privateNotes: [...notesAdded, ...getState().privateNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
        }
    }


    @Action(CopyNotes)
    async copyNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote }: CopyNotes) {
        const selectedIds = getState().selectedIds;
        const newNotes = await this.api.copyNotes(selectedIds, typeNote).toPromise();

        switch (typeNote) {
            case NoteType.Archive: {
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    privateNotes: [...newNotes, ...getState().privateNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
            case NoteType.Shared: {
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    privateNotes: [...newNotes, ...getState().privateNotes]
                });
                dispatch([UnSelectAllNote, RemoveFromDomMurri]);
                break;
            }
            case NoteType.Private: {
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateNotes: [...newNotes, ...getState().privateNotes],
                    notesAddingPrivate: [...newNotes]
                });
                dispatch([UnSelectAllNote, ClearAddedPrivateNotes]);
                break;
            }
        }
    }

    @Action(RemoveFromDomMurri)
    removeFromDomMurri({ patchState }: StateContext<NoteState>) {
        patchState({
            removeFromMurriEvent: [],
        });
    }

    @Action(ClearAddedPrivateNotes)
    clearAddedPrivateNotesEvent({ patchState }: StateContext<NoteState>) {
        patchState({
            notesAddingPrivate: [],
        });
    }

    @Action(PositionNote)
    async changePosition({patchState, getState}: StateContext<NoteState>, {order, typeNote}: PositionNote) {
        await this.orderService.changeOrder(order).toPromise();

        switch (typeNote) {
            case NoteType.Archive: {
                let archiveNotes = getState().archiveNotes;
                const changedNote = archiveNotes.find(x => x.id === order.entityId);
                archiveNotes = archiveNotes.filter(x => x.id !== order.entityId);
                archiveNotes.splice(order.position - 1, 0 , changedNote);
                patchState({archiveNotes});
                break;
            }
            case NoteType.Shared: {
                let sharedNotes = getState().sharedNotes;
                const changedNote = sharedNotes.find(x => x.id === order.entityId);
                sharedNotes = sharedNotes.filter(x => x.id !== order.entityId);
                sharedNotes.splice(order.position - 1, 0 , changedNote);
                patchState({sharedNotes});
                break;
            }
            case NoteType.Private: {
                let privateNotes = getState().privateNotes;
                const changedNote = privateNotes.find(x => x.id === order.entityId);
                privateNotes = privateNotes.filter(x => x.id !== order.entityId);
                privateNotes.splice(order.position - 1, 0 , changedNote);
                patchState({privateNotes});
                break;
            }
            case NoteType.Deleted: {
                let deletedNotes = getState().deletedNotes;
                const changedNote = deletedNotes.find(x => x.id === order.entityId);
                deletedNotes = deletedNotes.filter(x => x.id !== order.entityId);
                deletedNotes.splice(order.position - 1, 0 , changedNote);
                patchState({deletedNotes});
                break;
            }
        }
    }

    // NOTES SELECTION
    @Action(SelectIdNote)
    select({ patchState, getState }: StateContext<NoteState>, { id }: SelectIdNote) {
        const ids = getState().selectedIds;
        patchState({ selectedIds: [id, ...ids] });
    }

    @Action(UnSelectIdNote)
    unSelect({ getState, patchState }: StateContext<NoteState>, { id }: UnSelectIdNote) {
        let ids = getState().selectedIds;
        ids = ids.filter(x => x !== id);
        patchState({ selectedIds: [...ids] });
    }

    @Action(UnSelectAllNote)
    unselectAll({ patchState, getState }: StateContext<NoteState>) {
        patchState({ selectedIds: [] });
    }

    @Action(SelectAllNote)
    selectAll({ patchState, getState }: StateContext<NoteState>, { typeNote }: SelectAllNote) {
        let ids;
        switch (typeNote) {
            case NoteType.Archive: {
                ids = getState().archiveNotes.map(x => x.id);
                break;
            }
            case NoteType.Private: {
                ids = getState().privateNotes.map(x => x.id);
                break;
            }
            case NoteType.Deleted: {
                ids = getState().deletedNotes.map(x => x.id);
                break;
            }
            case NoteType.Shared: {
                ids = getState().sharedNotes.map(x => x.id);
                break;
            }
        }
        patchState({ selectedIds: [...ids] });
    }
}
