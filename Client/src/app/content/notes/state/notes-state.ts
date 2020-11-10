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
    PositionNote, AddLabelOnNote, RemoveLabelFromNote, LoadAllNotes, ClearUpdatelabelEvent, UpdateLabelOnNote, UpdateOneNote
} from './notes-actions';
import { patch, updateItem } from '@ngxs/store/operators';
import { NoteColorPallete } from 'src/app/shared/enums/NoteColors';
import { UpdateColor } from './updateColor';
import { OrderService } from 'src/app/shared/services/order.service';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { LabelsOnSelectedNotes } from '../models/labelsOnSelectedNotes';
import { Label } from '../../labels/models/label';
import { UpdateLabelEvent } from './updateLabels';
import { Notes } from './Notes';
import { Observable } from 'rxjs';


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

        const selectedIds = getState().selectedIds;
        await this.api.changeColor(selectedIds, color).toPromise();


        const notes = getState().notes.find(z => z.typeNotes === typeNote).notes;
        const newNotes = notes.map(note => {
            note = { ...note };
            if (selectedIds.some(z => z === note.id)) {
                note.color = color;
            }
            return note;
        });

        const notesForUpdate = notes.filter(x => selectedIds.some(z => z === x.id)).map(note => {
            note = { ...note, color };
            return note;
        });
        const updateColor = notesForUpdate.map(note => this.mapFromNoteToUpdateColor(note));
        patchState({ updateColorEvent: updateColor });
        dispatch([new UpdateNotes(new Notes(typeNote, newNotes), typeNote), UnSelectAllNote, ClearColorNotes]);
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
        await this.api.setDeleteNotes(selectedIds).toPromise();
        this.tranformFromTo(getState, patchState, dispatch, typeNote, NoteType.Deleted, selectedIds);
    }

    // Deleting
    @Action(DeleteNotesPermanently)
    async deleteNotesPermanently({ getState, dispatch, patchState }: StateContext<NoteState>) {
        const selectedIds = getState().selectedIds;
        await this.api.deleteNotes(selectedIds).toPromise();

        const notesFrom = getState().notes.find(x => x.typeNotes === NoteType.Deleted);
        const notesFromNew = notesFrom.notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
        dispatch(new UpdateNotes(new Notes(NoteType.Deleted, notesFromNew), NoteType.Deleted));

        patchState({
            removeFromMurriEvent: [...selectedIds]
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }


    // Archive
    @Action(ArchiveNotes)
    async archiveNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: ArchiveNotes) {
        const selectedIds = getState().selectedIds;
        await this.api.archiveNotes(selectedIds).toPromise();
        this.tranformFromTo(getState, patchState, dispatch, typeNote, NoteType.Archive, selectedIds);
    }

    @Action(MakePublicNotes)
    async makePublicNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePublicNotes) {
        console.log('TODO');
    }

    @Action(MakePrivateNotes)
    async makePrivateNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote }: MakePrivateNotes) {

        const selectedIds = getState().selectedIds;
        await this.api.makePrivateNotes(selectedIds).toPromise();
        this.tranformFromTo(getState, patchState, dispatch, typeNote, NoteType.Private, selectedIds);
    }

    tranformFromTo(
        getState: () => NoteState,
        patchState: (val: Partial<NoteState>) => NoteState,
        dispatch: (actions: any) => Observable<void>,
        typeFrom: NoteType,
        typeTo: NoteType,
        selectedIds: string[]) {

        const notesFrom = getState().notes.find(x => x.typeNotes === typeFrom);
        const notesFromNew = notesFrom.notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);

        const notesAdded = notesFrom.notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
        dispatch(new UpdateNotes(new Notes(typeFrom, notesFromNew), typeFrom));

        const notesTo = getState().notes.find(z => z.typeNotes === typeTo).notes;
        const newNotesTo = [...notesAdded, ...notesTo];
        dispatch(new UpdateNotes(new Notes(typeTo, newNotesTo), typeTo));

        patchState({
            removeFromMurriEvent: [...selectedIds],
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }

    @Action(CopyNotes)
    async copyNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote }: CopyNotes) {

        const selectedIds = getState().selectedIds;
        const newNotes = await this.api.copyNotes(selectedIds).toPromise();
        const privateNotes = getState().notes.find(z => z.typeNotes === NoteType.Private).notes;
        dispatch(new UpdateNotes(new Notes(NoteType.Private, [...newNotes, ...privateNotes]), NoteType.Private));
        dispatch([UnSelectAllNote]);

        if (typeNote === NoteType.Private) {
            patchState({
                notesAddingPrivate: [...newNotes]
            });
            dispatch(ClearAddedPrivateNotes);
        }
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

        const selectedIds = getState().selectedIds;
        await this.api.addLabel(label.id, selectedIds).toPromise();
        const notes = getState().notes.find(z => z.typeNotes === typeNote).notes;

        const notesForUpdate = notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
            .map(note => { note = { ...note }; return note; });
        const labelsArray = this.addLabelOnNote(notesForUpdate, label, patchState);
        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

        const notesForStore = notes.map(note => {
            note = { ...note };
            if (selectedIds.indexOf(note.id) !== -1) {
                if (!note.labels.some(z => z.id === label.id)) {
                    note.labels = [...note.labels, { id: label.id, color: label.color, name: label.name, isDeleted: label.isDeleted }];
                }
            }
            return note;
        });
        dispatch(new UpdateNotes(new Notes(typeNote, notesForStore), typeNote));
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
        const selectedIds = getState().selectedIds;
        await this.api.removeLabel(label.id, getState().selectedIds).toPromise();
        const notes = getState().notes.find(z => z.typeNotes === typeNote).notes;

        const notesForUpdate = notes.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false)
            .map(note => { note = { ...note }; return note; });
        const labelsArray = this.removeLabelFromNote(notesForUpdate, label, patchState);
        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

        const notesForStore = notes.map(note => {
            note = { ...note };
            if (selectedIds.indexOf(note.id) !== -1) {
                note.labels = note.labels.filter(z => z.id !== label.id);
            }
            return note;
        });
        dispatch(new UpdateNotes(new Notes(typeNote, notesForStore), typeNote));
    }


    @Action(UpdateLabelOnNote)
    updateLabelOnNote({ patchState, getState, dispatch }: StateContext<NoteState>, { label }: UpdateLabelOnNote) {

        let labelUpdate: UpdateLabelEvent[] = [];
        for (const notes of getState().notes) {
            const notesUpdate = notes.notes.map(note => {
                if (note.labels.some(z => z.id === label.id)) {
                    note = this.updateLabel(note, label);
                    labelUpdate = [{ id: note.id, labels: note.labels }, ...labelUpdate];
                } else {
                    note = { ...note };
                }
                return note;
            });
            dispatch(new UpdateNotes(new Notes(notes.typeNotes, notesUpdate), notes.typeNotes));
        }
        patchState({ updateLabelsEvent: labelUpdate });
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
    async changePosition({ patchState, getState, dispatch }: StateContext<NoteState>, { order, typeNote }: PositionNote) {

        let notes = getState().notes.find(z => z.typeNotes === typeNote).notes;
        const changedNote = notes.find(x => x.id === order.entityId);
        const flag = notes.indexOf(changedNote);
        if (flag + 1 !== order.position) {
            await this.orderService.changeOrder(order).toPromise();
            notes = notes.filter(x => x.id !== order.entityId);
            notes.splice(order.position - 1, 0, changedNote);
            dispatch(new UpdateNotes(new Notes(typeNote, [...notes]), typeNote));
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
        const notes = getState().notes.find(z => z.typeNotes === typeNote).notes;
        const ids = notes.map(z => z.id);
        const labelsIds = notes.map(x => {
            const values: LabelsOnSelectedNotes = {
                id: x.id,
                labelsIds: x.labels.map(z => z.id)
            };
            return values;
        });
        patchState({ selectedIds: [...ids], labelsIdsFromSelectedIds: labelsIds });
    }

    @Action(UpdateOneNote)
    updateOneSmallNote({ dispatch, getState }: StateContext<NoteState>, { note, typeNote}: UpdateOneNote) {
        let notes = getState().notes.find(z => z.typeNotes === typeNote).notes;
        notes = notes.map(nt => {
            if (nt.id === note.id) {
                nt = {...note};
            }
            return nt;
        });
        dispatch(new UpdateNotes(new Notes(typeNote, [...notes]), typeNote));
    }
}
