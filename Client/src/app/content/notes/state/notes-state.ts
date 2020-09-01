import { SmallNote } from '../models/smallNote';
import { FullNote } from '../models/fullNote';
import { State, Selector, StateContext, Action, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api-notes.service';
import {
    LoadPrivateNotes, AddNote, LoadFullNote, UpdateFullNote,
    LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes, LoadAllExceptNotes, ChangeColorNote, SelectIdNote,
    UnSelectIdNote, UnSelectAllNote, SelectAllNote, UpdateSmallNote, ClearColorNotes, SetDeleteNotes
    , DeleteNotesPermanently, RestoreNotes, ArchiveNotes,
    RemoveFromDomMurri, MakePublicNotes, MakePrivateNotes, CopyNotes, ClearAddedPrivateNotes,
    PositionNote, AddLabelOnNote, RemoveLabelFromNote, LoadAllNotes, ClearUpdatelabelEvent, UpdateLabelOnNote
} from './notes-actions';
import { tap } from 'rxjs/operators';
import { patch, updateItem } from '@ngxs/store/operators';
import { NoteColorPallete } from 'src/app/shared/enums/NoteColors';
import { UpdateColor } from './updateColor';
import { OrderService } from 'src/app/shared/services/order.service';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LabelsOnSelectedNotes } from '../models/labelsOnSelectedNotes';
import { Label } from '../../labels/models/label';
import { UpdateLabel } from '../../labels/state/labels-actions';
import { UpdateLabelEvent } from './updateLabels';
import { ClearColorFolders } from '../../folders/state/folders-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';


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
    labelsIdsFromSelectedIds: LabelsOnSelectedNotes[];
    updateColorEvent: UpdateColor[];
    updateLabelsEvent: UpdateLabelEvent[];
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
        labelsIdsFromSelectedIds: [],
        updateColorEvent: [],
        updateLabelsEvent: [],
        removeFromMurriEvent: [],
        notesAddingPrivate: []
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes,
                private orderService: OrderService,
                private store: Store) {
    }

    @Selector()
    static selectedCount(state: NoteState): number {
        return state.selectedIds.length;
    }

    @Selector()
    static activeMenu(state: NoteState): boolean {
        return state.selectedIds.length > 0 ? true : false;
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
    static updateLabelEvent(state: NoteState): UpdateLabelEvent[] {
        return state.updateLabelsEvent;
    }

    @Selector()
    static selectedIds(state: NoteState): string[] {
        return state.selectedIds;
    }

    @Selector()
    static labelsIds(state: NoteState): LabelsOnSelectedNotes[] {
        return state.labelsIdsFromSelectedIds;
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
    loadAllNotes({ dispatch }: StateContext<NoteState>) {
        dispatch([LoadPrivateNotes, LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes]);
    }

    @Action(LoadAllExceptNotes)
    async loadExceptedNotes({ dispatch }: StateContext<NoteState>, {typeNote}: LoadAllExceptNotes) {
        switch (typeNote) {
            case NoteType.Archive: {
                dispatch([LoadPrivateNotes, LoadSharedNotes, LoadDeletedNotes]);
                break;
            }
            case NoteType.Private: {
                dispatch([LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes]);
                break;
            }
            case NoteType.Shared: {
                dispatch([LoadPrivateNotes, LoadArchiveNotes, LoadDeletedNotes]);
                break;
            }
            case NoteType.Deleted: {
                dispatch([LoadPrivateNotes, LoadSharedNotes, LoadArchiveNotes]);
                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }
    }

    @Action(AddNote)
    async newNote({ getState, patchState }: StateContext<NoteState>) {
        const id = await this.api.new().toPromise();
        const notes = getState().privateNotes;
        patchState({
            privateNotes: [{ id, title: '', color: NoteColorPallete.Green, labels: [] }, ...notes],
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
            case EntityType.NoteArchive: {
                notes = getState().archiveNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });

                notes.forEach(z => z.color = color);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));
                const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
                patchState({ updateColorEvent: updateColor });
                dispatch([UnSelectAllNote, ClearColorNotes]);
                break;
            }
            case EntityType.NotePrivate: {
                notes = getState().privateNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });

                notes.forEach(z => z.color = color);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));
                const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
                patchState({ updateColorEvent: updateColor });
                dispatch([UnSelectAllNote, ClearColorNotes]);
                break;
            }
            case EntityType.NoteDeleted: {
                notes = getState().deletedNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });

                notes.forEach(z => z.color = color);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));
                const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
                patchState({ updateColorEvent: updateColor });
                dispatch([UnSelectAllNote, ClearColorNotes]);
                break;
            }
            case EntityType.NoteShared: {
                notes = getState().sharedNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });

                notes.forEach(z => z.color = color);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));
                const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
                patchState({ updateColorEvent: updateColor });
                dispatch([UnSelectAllNote, ClearColorNotes]);
                break;
            }
            case EntityType.NoteInner: {

                let noteType = NoteType.Archive;
                notes = getState().archiveNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });

                if (notes.length === 0) {
                    notes = getState().privateNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });
                    noteType = NoteType.Private;
                }
                if (notes.length === 0) {
                    notes = getState().deletedNotes.filter(x => selectedIds.some(z => z === x.id))
                    .map(note => { note = { ...note }; return note; });
                    noteType = NoteType.Deleted;
                }
                if (notes.length === 0) {
                    notes = getState().sharedNotes.filter(x => selectedIds.some(z => z === x.id))
                        .map(note => { note = { ...note }; return note; });
                    noteType = NoteType.Shared;
                }


                notes.forEach(z => z.color = color);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, noteType)));
                const updateColor = notes.map(note => this.mapFromNoteToUpdateColor(note));
                patchState({ updateColorEvent: updateColor });
                dispatch([ClearColorNotes]);
                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }
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

        let notes;
        switch (typeNote) {
            case EntityType.NoteArchive: {

                await this.api.setDeleteNotes(selectedIds, NoteType.Archive).toPromise();

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
            case EntityType.NotePrivate: {

                await this.api.setDeleteNotes(selectedIds, NoteType.Private).toPromise();

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
            case EntityType.NoteShared: {

                await this.api.setDeleteNotes(selectedIds, NoteType.Shared).toPromise();

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
            default: {
                throw new Error('Inccorect type');
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

        switch (typeNote) {
            case EntityType.NoteDeleted: {

                await this.api.archiveNotes(selectedIds, NoteType.Deleted).toPromise();

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
            case EntityType.NotePrivate: {

                await this.api.archiveNotes(selectedIds, NoteType.Private).toPromise();

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
            case EntityType.NoteShared: {

                await this.api.archiveNotes(selectedIds, NoteType.Shared).toPromise();

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
            default: {
                throw new Error('Inccorect type');
            }
        }
    }

    @Action(MakePublicNotes)
    async makePublicNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePublicNotes) {
        const selectedIds = getState().selectedIds;


        switch (typeNote) {
            case EntityType.NotePrivate: {

                await this.api.makePublicNotes(selectedIds, NoteType.Private).toPromise();

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
            case EntityType.NoteArchive: {

                await this.api.makePublicNotes(selectedIds, NoteType.Archive).toPromise();

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
            default: {
                throw new Error('Inccorect type');
            }
        }
    }

    @Action(MakePrivateNotes)
    async makePrivateNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePrivateNotes) {
        const selectedIds = getState().selectedIds;

        switch (typeNote) {
            case EntityType.NoteArchive: {

                await this.api.makePrivateNotes(selectedIds, NoteType.Archive).toPromise();

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
            case EntityType.NoteShared: {

                await this.api.makePrivateNotes(selectedIds, NoteType.Shared).toPromise();

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
            default: {
                throw new Error('Inccorect type');
            }
        }
    }


    @Action(CopyNotes)
    async copyNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote }: CopyNotes) {
        const selectedIds = getState().selectedIds;

        switch (typeNote) {
            case EntityType.NoteArchive: {
                const newNotes = await this.api.copyNotes(selectedIds, NoteType.Archive).toPromise();
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateNotes: [...newNotes, ...getState().privateNotes]
                });
                dispatch([UnSelectAllNote]);
                break;
            }
            case EntityType.NoteShared: {
                const newNotes = await this.api.copyNotes(selectedIds, NoteType.Shared).toPromise();
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateNotes: [...newNotes, ...getState().privateNotes]
                });
                dispatch([UnSelectAllNote]);
                break;
            }
            case EntityType.NotePrivate: {
                const newNotes = await this.api.copyNotes(selectedIds, NoteType.Private).toPromise();
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateNotes: [...newNotes, ...getState().privateNotes],
                    notesAddingPrivate: [...newNotes]
                });
                dispatch([UnSelectAllNote, ClearAddedPrivateNotes]);
                break;
            }
            case EntityType.NoteDeleted: {
                const newNotes = await this.api.copyNotes(selectedIds, NoteType.Deleted).toPromise();
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateNotes: [...newNotes, ...getState().privateNotes],
                    notesAddingPrivate: [...newNotes]
                });
                dispatch([UnSelectAllNote, ClearAddedPrivateNotes]);
                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }
    }

    @Action(ClearUpdatelabelEvent)
    clearUpdateEventLabel({patchState, getState}: StateContext<NoteState>, {noteId}: ClearUpdatelabelEvent) {
        patchState({
            updateLabelsEvent: getState().updateLabelsEvent.filter(x => x.id !== noteId)
        });
    }

    // LABELS ADD
    addLabelOnNote(notes: SmallNote[], label: Label, patchState: (val: Partial<NoteState>) => NoteState) {

        const labelUpdate: UpdateLabelEvent[] = [];
        const labelsArray: LabelsOnSelectedNotes[] = [];
        notes.forEach(x => {
            if (!x.labels.some(z => z.id === label.id)) {
                x.labels = [...x.labels, {id: label.id , color: label.color, name: label.name, isDeleted: label.isDeleted }];
                labelUpdate.push({id: x.id, labels: x.labels});
            }
            labelsArray.push({
                labelsIds: [...x.labels.map(z => z.id)],
                id: x.id
            });
        });
        patchState({updateLabelsEvent: labelUpdate});
        return labelsArray;
    }

    @Action(AddLabelOnNote)
    async addLabel({getState, dispatch, patchState}: StateContext<NoteState>, {label, typeNote}: AddLabelOnNote) {

        const selectedIds = getState().selectedIds;
        await this.api.addLabel(label.id, selectedIds).toPromise();

        switch (typeNote) {
            case EntityType.NotePrivate: {

                const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});
                break;
            }
            case EntityType.NoteArchive: {

                const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                break;
            }
            case EntityType.NoteDeleted: {

                const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                break;
            }
            case EntityType.NoteShared: {

                const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                break;
            }
            case EntityType.NoteInner: {

                switch (this.store.selectSnapshot(AppStore.getInnerNoteType)) {
                    case NoteType.Archive: {

                        const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                        break;
                    }
                    case NoteType.Deleted: {

                        const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});


                        break;
                    }
                    case NoteType.Private: {

                        const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                        break;
                    }
                    case NoteType.Shared: {

                        const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                        break;
                    }
                    default: {
                        throw new Error('Inccorect type');
                    }
                }
                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }
    }


    removeLabelFromNote(notes: SmallNote[], label: Label, patchState: (val: Partial<NoteState>) => NoteState) {
        const labelUpdate: UpdateLabelEvent[] = [];
        const labelsArray: LabelsOnSelectedNotes[] = [];
        notes.forEach(x => x.labels = x.labels.filter(z => z.id !== label.id));
        notes.forEach(x => {
            labelsArray.push({
                labelsIds: [...x.labels.map(z => z.id)],
                id: x.id
            });
            labelUpdate.push({id: x.id, labels: x.labels});
        });
        patchState({updateLabelsEvent: labelUpdate});
        return labelsArray;
    }

    @Action(RemoveLabelFromNote)
    async removeLabel({getState, dispatch, patchState}: StateContext<NoteState>, {label, typeNote}: RemoveLabelFromNote) {

        const selectedIds = getState().selectedIds;
        await this.api.removeLabel(label.id, getState().selectedIds).toPromise();

        switch (typeNote) {
            case EntityType.NotePrivate: {

                const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));
                patchState({labelsIdsFromSelectedIds: [...labelsArray]});
                break;
            }
            case EntityType.NoteArchive: {

                const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});
                break;
            }
            case EntityType.NoteDeleted: {

                const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                break;
            }
            case EntityType.NoteShared: {

                const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                break;
            }
            case EntityType.NoteInner: {

                switch (this.store.selectSnapshot(AppStore.getInnerNoteType)) {
                    case NoteType.Archive: {

                        const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                        break;
                    }
                    case NoteType.Deleted: {

                        const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                        break;
                    }
                    case NoteType.Private: {

                        const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));
                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});

                        break;
                    }
                    case NoteType.Shared: {

                        const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                        .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                        patchState({labelsIdsFromSelectedIds: [...labelsArray]});
                        break;
                    }
                    default: {
                        throw new Error('Inccorect type');
                    }
                }
                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }
    }


    @Action(UpdateLabelOnNote)
    updateLabelOnNote({ patchState, getState, dispatch }: StateContext<NoteState>, {label}: UpdateLabelOnNote) {
        let labelUpdate: UpdateLabelEvent[] = [];
        const noteP = getState().privateNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteP) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{id: updateNote.id, labels: updateNote.labels}, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Private));
            patchState({updateLabelsEvent: labelUpdate});
        }
        const noteS = getState().sharedNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteS) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{id: updateNote.id, labels: updateNote.labels}, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Shared));
            patchState({updateLabelsEvent: labelUpdate});
        }
        const noteD = getState().deletedNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteD) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{id: updateNote.id, labels: updateNote.labels}, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Deleted));
            patchState({updateLabelsEvent: labelUpdate});
        }
        const noteA = getState().archiveNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteA) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{id: updateNote.id, labels: updateNote.labels}, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Archive));
            patchState({updateLabelsEvent: labelUpdate});
        }
    }

    updateLabel(note: SmallNote, label: Label): SmallNote {
        const noteLabels = [...note.labels];
        const index = noteLabels.findIndex(x => x.id === label.id);
        noteLabels[index] = {...label};
        const updateNote: SmallNote = {...note , labels: noteLabels};
        return updateNote;
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
            case EntityType.NoteArchive: {
                let archiveNotes = getState().archiveNotes;
                const changedNote = archiveNotes.find(x => x.id === order.entityId);
                archiveNotes = archiveNotes.filter(x => x.id !== order.entityId);
                archiveNotes.splice(order.position - 1, 0 , changedNote);
                patchState({archiveNotes});
                break;
            }
            case EntityType.NoteShared: {
                let sharedNotes = getState().sharedNotes;
                const changedNote = sharedNotes.find(x => x.id === order.entityId);
                sharedNotes = sharedNotes.filter(x => x.id !== order.entityId);
                sharedNotes.splice(order.position - 1, 0 , changedNote);
                patchState({sharedNotes});
                break;
            }
            case EntityType.NotePrivate: {
                let privateNotes = getState().privateNotes;
                const changedNote = privateNotes.find(x => x.id === order.entityId);
                privateNotes = privateNotes.filter(x => x.id !== order.entityId);
                privateNotes.splice(order.position - 1, 0 , changedNote);
                patchState({privateNotes});
                break;
            }
            case EntityType.NoteDeleted: {
                let deletedNotes = getState().deletedNotes;
                const changedNote = deletedNotes.find(x => x.id === order.entityId);
                deletedNotes = deletedNotes.filter(x => x.id !== order.entityId);
                deletedNotes.splice(order.position - 1, 0 , changedNote);
                patchState({deletedNotes});
                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }
    }

    // NOTES SELECTION
    @Action(SelectIdNote)
    select({ patchState, getState }: StateContext<NoteState>, { id, labelIds }: SelectIdNote) {
        const ids = getState().selectedIds;
        const select: LabelsOnSelectedNotes = {
            id,
            labelsIds: labelIds
        };
        patchState({ selectedIds: [id, ...ids], labelsIdsFromSelectedIds: [select, ...getState().labelsIdsFromSelectedIds] });
    }


    @Action(UnSelectIdNote)
    unSelect({ getState, patchState }: StateContext<NoteState>, { id }: UnSelectIdNote) {
        let ids = getState().selectedIds;
        ids = ids.filter(x => x !== id);
        const labelsIds = getState().labelsIdsFromSelectedIds.filter(x => x.id !== id);
        patchState({ selectedIds: [...ids], labelsIdsFromSelectedIds: [...labelsIds] });
    }

    @Action(UnSelectAllNote)
    unselectAll({ patchState, getState }: StateContext<NoteState>) {
        patchState({ selectedIds: [], labelsIdsFromSelectedIds: [] });
    }

    @Action(SelectAllNote)
    selectAll({ patchState, getState }: StateContext<NoteState>, { typeNote }: SelectAllNote) {
        let ids;
        let labelsIds: LabelsOnSelectedNotes[];
        switch (typeNote) {
            case EntityType.NoteArchive: {
                ids = getState().archiveNotes.map(x => x.id);
                labelsIds = getState().archiveNotes.map(x => {
                    const values: LabelsOnSelectedNotes = {
                        id: x.id,
                        labelsIds: x.labels.map(z => z.id)
                    };
                    return values;
                });
                break;
            }
            case EntityType.NotePrivate: {
                ids = getState().privateNotes.map(x => x.id);
                labelsIds = getState().archiveNotes.map(x => {
                    const values: LabelsOnSelectedNotes = {
                        id: x.id,
                        labelsIds: x.labels.map(z => z.id)
                    };
                    return values;
                });
                break;
            }
            case EntityType.NoteDeleted: {
                ids = getState().deletedNotes.map(x => x.id);
                labelsIds = getState().archiveNotes.map(x => {
                    const values: LabelsOnSelectedNotes = {
                        id: x.id,
                        labelsIds: x.labels.map(z => z.id)
                    };
                    return values;
                });
                break;
            }
            case EntityType.NoteShared: {
                ids = getState().sharedNotes.map(x => x.id);
                labelsIds = getState().archiveNotes.map(x => {
                    const values: LabelsOnSelectedNotes = {
                        id: x.id,
                        labelsIds: x.labels.map(z => z.id)
                    };
                    return values;
                });
                break;
            }
            default: {
                throw new Error('Incorrect type note');
            }
        }
        patchState({ selectedIds: [...ids], labelsIdsFromSelectedIds: labelsIds });
    }
}
