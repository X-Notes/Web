import { SmallNote } from '../models/smallNote';
import { State, Selector, StateContext, Action, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api-notes.service';
import {
    LoadPrivateNotes, AddNote,
    LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes, LoadAllExceptNotes, ChangeColorNote, SelectIdNote,
    UnSelectIdNote, UnSelectAllNote, SelectAllNote, UpdateNotes, ClearColorNotes, SetDeleteNotes
    , DeleteNotesPermanently, ArchiveNotes,
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
import { UpdateLabelEvent } from './updateLabels';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { Notes } from './Notes';


interface NoteState {
    notes: Notes[];
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
        notes: [],
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
        return state.notes.find(x => x.typeNotes === NoteType.Private).notes;
    }

    @Selector()
    static sharedNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteType.Shared).notes;
    }

    @Selector()
    static deletedNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteType.Deleted).notes;
    }

    @Selector()
    static archiveNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteType.Archive).notes;
    }

    // Get count notes
    @Selector()
    static privateCount(state: NoteState): number {
        return state.notes.find(x => x.typeNotes === NoteType.Private).count;
    }

    @Selector()
    static archiveCount(state: NoteState): number {
        return state.notes.find(x => x.typeNotes === NoteType.Archive).count;
    }

    @Selector()
    static deletedCount(state: NoteState): number {
        return state.notes.find(x => x.typeNotes === NoteType.Deleted).count;
    }

    @Selector()
    static sharedCount(state: NoteState): number {
        return state.notes.find(x => x.typeNotes === NoteType.Shared).count;
    }

    @Action(LoadPrivateNotes)
    async loadPrivateNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().notes.find(z => z.typeNotes === NoteType.Private)) {
            const notesAPI = await this.api.getPrivateNotes().toPromise();
            patchState({
                notes: [...getState().notes, notesAPI]
            });
        }
    }

    @Action(LoadSharedNotes)
    async loadSharedNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().notes.find(z => z.typeNotes === NoteType.Shared)) {
            const notesAPI = await this.api.getSharedNotes().toPromise();
            patchState({
                notes: [...getState().notes, notesAPI]
            });
        }
    }

    @Action(LoadArchiveNotes)
    async loadArchiveNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().notes.find(z => z.typeNotes === NoteType.Archive)) {
            const notesAPI = await this.api.getArchiveNotes().toPromise();
            patchState({
                notes: [...getState().notes, notesAPI]
            });
        }
    }

    @Action(LoadDeletedNotes)
    async loadDeletedNotes({ getState, patchState }: StateContext<NoteState>) {
        if (!getState().notes.find(z => z.typeNotes === NoteType.Deleted)) {
            const notesAPI = await this.api.getDeletedNotes().toPromise();
            patchState({
                notes: [...getState().notes, notesAPI]
            });
        }
    }

    @Action(LoadAllNotes)
    loadAllNotes({ dispatch }: StateContext<NoteState>) {
        dispatch([LoadPrivateNotes, LoadSharedNotes, LoadArchiveNotes, LoadDeletedNotes]);
    }

    @Action(LoadAllExceptNotes)
    async loadExceptedNotes({ dispatch }: StateContext<NoteState>, { typeNote }: LoadAllExceptNotes) {
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
    async newNote({ getState, patchState, dispatch }: StateContext<NoteState>) {
        const id = await this.api.new().toPromise();
        const newNote: SmallNote = { id, title: '', color: NoteColorPallete.Green, labels: [], refType: 0 };

        const notes = getState().notes.find(x => x.typeNotes === NoteType.Private);
        const toUpdate = new Notes(NoteType.Private, [newNote, ...notes.notes]);
        dispatch(new UpdateNotes(toUpdate, NoteType.Private));
    }



    @Action(UpdateNotes)
    async updateSmallNote({ setState }: StateContext<NoteState>, { notes, typeNote }: UpdateNotes) {
        setState(
            patch({
                notes: updateItem<Notes>(notess => notess.typeNotes === typeNote, notes)
            })
        );
    }

    // FUNCTION UPPER MENU


    // Color change
    @Action(ChangeColorNote)
    async changeColor({ patchState, getState, dispatch }: StateContext<NoteState>, { color, typeNote }: ChangeColorNote) {
        /*
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
                // TODO UPDATE FOR ALL USERS
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
        }*/
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
        /*
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
                // TODO UPDATE FOR ALL USERS
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
        */
    }

    // Deleting
    @Action(DeleteNotesPermanently)
    async deleteNotesPermanently({ getState, dispatch, patchState }: StateContext<NoteState>) {
        /*
        const selectedIds = getState().selectedIds;
        await this.api.deleteNotes(selectedIds).toPromise();
        patchState({
            removeFromMurriEvent: [...selectedIds],
            countDeleted: getState().countDeleted - selectedIds.length
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
        */
    }


    // Archive
    @Action(ArchiveNotes)
    async archiveNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: ArchiveNotes) {
        /*
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
                // TODO UPDATE FOR ALL USERS
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
        */
    }

    @Action(MakePublicNotes)
    async makePublicNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePublicNotes) {
    }

    @Action(MakePrivateNotes)
    async makePrivateNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePrivateNotes) {

        const selectedIds = getState().selectedIds;
        await this.api.makePrivateNotes(selectedIds, typeNote).toPromise();
        const notesFrom = getState().notes.find(x => x.typeNotes === typeNote);
        const notesFromNew = notesFrom.notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
        const notesAdded = notesFrom.notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);

        dispatch(new UpdateNotes(new Notes(typeNote, notesFromNew), typeNote));

        const privateNotes = getState().notes.find(z => z.typeNotes === NoteType.Private).notes;
        const newPrivateNotes = [...notesAdded, ...privateNotes];
        dispatch(new UpdateNotes(new Notes(typeNote, newPrivateNotes), typeNote));

        patchState({
            removeFromMurriEvent: [...selectedIds],
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }


    @Action(CopyNotes)
    async copyNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote }: CopyNotes) {
        /*
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
                // TODO UPDATE FOR ALL USERS
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
        }*/
    }

    @Action(ClearUpdatelabelEvent)
    clearUpdateEventLabel({ patchState, getState }: StateContext<NoteState>, { noteId }: ClearUpdatelabelEvent) {
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
                x.labels = [...x.labels, { id: label.id, color: label.color, name: label.name, isDeleted: label.isDeleted }];
                labelUpdate.push({ id: x.id, labels: x.labels });
            }
            labelsArray.push({
                labelsIds: [...x.labels.map(z => z.id)],
                id: x.id
            });
        });
        patchState({ updateLabelsEvent: labelUpdate });
        return labelsArray;
    }

    @Action(AddLabelOnNote)
    async addLabel({ getState, dispatch, patchState }: StateContext<NoteState>, { label, typeNote }: AddLabelOnNote) {

        /*
        const selectedIds = getState().selectedIds;
        await this.api.addLabel(label.id, selectedIds).toPromise();

        switch (typeNote) {
            case EntityType.NotePrivate: {

                const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });
                break;
            }
            case EntityType.NoteArchive: {

                const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                break;
            }
            case EntityType.NoteDeleted: {

                const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                break;
            }
            case EntityType.NoteShared: {
                // TODO UPDATE FOR ALL USERS
                const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.addLabelOnNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                break;
            }
            case EntityType.NoteInner: {

                switch (this.store.selectSnapshot(AppStore.getInnerNoteType)) {
                    case NoteType.Archive: {

                        const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                        break;
                    }
                    case NoteType.Deleted: {

                        const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });


                        break;
                    }
                    case NoteType.Private: {

                        const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                        break;
                    }
                    case NoteType.Shared: {

                        const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.addLabelOnNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

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
        }*/
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
            labelUpdate.push({ id: x.id, labels: x.labels });
        });
        patchState({ updateLabelsEvent: labelUpdate });
        return labelsArray;
    }

    @Action(RemoveLabelFromNote)
    async removeLabel({ getState, dispatch, patchState }: StateContext<NoteState>, { label, typeNote }: RemoveLabelFromNote) {
        /*

        const selectedIds = getState().selectedIds;
        await this.api.removeLabel(label.id, getState().selectedIds).toPromise();

        switch (typeNote) {
            case EntityType.NotePrivate: {

                const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));
                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });
                break;
            }
            case EntityType.NoteArchive: {

                const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });
                break;
            }
            case EntityType.NoteDeleted: {

                const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                break;
            }
            case EntityType.NoteShared: {
                // TODO UPDATE FOR ALL USERS
                const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                    .map(note => { note = { ...note }; return note; });

                const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                break;
            }
            case EntityType.NoteInner: {

                switch (this.store.selectSnapshot(AppStore.getInnerNoteType)) {
                    case NoteType.Archive: {

                        const notes = getState().archiveNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Archive)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                        break;
                    }
                    case NoteType.Deleted: {

                        const notes = getState().deletedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Deleted)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                        break;
                    }
                    case NoteType.Private: {

                        const notes = getState().privateNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Private)));
                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

                        break;
                    }
                    case NoteType.Shared: {

                        const notes = getState().sharedNotes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
                            .map(note => { note = { ...note }; return note; });

                        const labelsArray = this.removeLabelFromNote(notes, label, patchState);
                        notes.forEach(note => dispatch(new UpdateSmallNote(note, NoteType.Shared)));

                        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });
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
        }*/
    }


    @Action(UpdateLabelOnNote)
    updateLabelOnNote({ patchState, getState, dispatch }: StateContext<NoteState>, { label }: UpdateLabelOnNote) {
        /*
        let labelUpdate: UpdateLabelEvent[] = [];
        const noteP = getState().privateNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteP) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{ id: updateNote.id, labels: updateNote.labels }, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Private));
            patchState({ updateLabelsEvent: labelUpdate });
        }
        const noteS = getState().sharedNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteS) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{ id: updateNote.id, labels: updateNote.labels }, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Shared));
            patchState({ updateLabelsEvent: labelUpdate });
        }
        const noteD = getState().deletedNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteD) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{ id: updateNote.id, labels: updateNote.labels }, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Deleted));
            patchState({ updateLabelsEvent: labelUpdate });
        }
        const noteA = getState().archiveNotes.filter(x => x.labels.some(z => z.id === label.id));
        for (const note of noteA) {
            const updateNote = this.updateLabel(note, label);
            labelUpdate = [{ id: updateNote.id, labels: updateNote.labels }, ...labelUpdate];
            dispatch(new UpdateSmallNote(updateNote, NoteType.Archive));
            patchState({ updateLabelsEvent: labelUpdate });
        }*/
    }

    updateLabel(note: SmallNote, label: Label): SmallNote {
        const noteLabels = [...note.labels];
        const index = noteLabels.findIndex(x => x.id === label.id);
        noteLabels[index] = { ...label };
        const updateNote: SmallNote = { ...note, labels: noteLabels };
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
    async changePosition({ patchState, getState }: StateContext<NoteState>, { order, typeNote }: PositionNote) {
        /*
        switch (typeNote) {
            case EntityType.NoteArchive: {
                let archiveNotes = getState().archiveNotes;
                const changedNote = archiveNotes.find(x => x.id === order.entityId);
                const flag = archiveNotes.indexOf(changedNote);
                if (flag + 1 !== order.position) {
                    await this.orderService.changeOrder(order).toPromise();
                    archiveNotes = archiveNotes.filter(x => x.id !== order.entityId);
                    archiveNotes.splice(order.position - 1, 0, changedNote);
                    patchState({ archiveNotes });
                }
                break;
            }
            case EntityType.NoteShared: {
                // TODO UPDATE FOR ALL USERS
                let sharedNotes = getState().sharedNotes;
                const changedNote = sharedNotes.find(x => x.id === order.entityId);
                const flag = sharedNotes.indexOf(changedNote);
                if (flag + 1 !== order.position) {
                    await this.orderService.changeOrder(order).toPromise();
                    sharedNotes = sharedNotes.filter(x => x.id !== order.entityId);
                    sharedNotes.splice(order.position - 1, 0, changedNote);
                    patchState({ sharedNotes });
                }
                break;
            }
            case EntityType.NotePrivate: {
                let privateNotes = getState().privateNotes;
                const changedNote = privateNotes.find(x => x.id === order.entityId);
                const flag = privateNotes.indexOf(changedNote);
                if (flag + 1 !== order.position) {
                    await this.orderService.changeOrder(order).toPromise();
                    privateNotes = privateNotes.filter(x => x.id !== order.entityId);
                    privateNotes.splice(order.position - 1, 0, changedNote);
                    patchState({ privateNotes });
                }
                break;
            }
            case EntityType.NoteDeleted: {
                let deletedNotes = getState().deletedNotes;
                const changedNote = deletedNotes.find(x => x.id === order.entityId);
                const flag = deletedNotes.indexOf(changedNote);
                if (flag + 1 !== order.position) {
                    await this.orderService.changeOrder(order).toPromise();
                    deletedNotes = deletedNotes.filter(x => x.id !== order.entityId);
                    deletedNotes.splice(order.position - 1, 0, changedNote);
                    patchState({ deletedNotes });
                }

                break;
            }
            default: {
                throw new Error('Inccorect type');
            }
        }*/
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
        /*
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
                // TODO UPDATE FOR ALL USERS
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
        patchState({ selectedIds: [...ids], labelsIdsFromSelectedIds: labelsIds });*/
    }
}
