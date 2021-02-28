import { SmallNote } from '../models/smallNote';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceNotes } from '../api-notes.service';
import {
    LoadNotes, AddNote, ChangeColorNote, SelectIdNote,
    UnSelectIdNote, UnSelectAllNote, SelectAllNote, UpdateNotes, ClearColorNotes, SetDeleteNotes
    , DeleteNotesPermanently, ArchiveNotes,
    RemoveFromDomMurri, MakePrivateNotes, CopyNotes, ClearAddedPrivateNotes,
    CancelAllSelectedLabels, UpdateSelectLabel,
    AddLabelOnNote, RemoveLabelFromNote,
    ClearUpdatelabelEvent, UpdateLabelOnNote,
    UpdateOneNote, PositionNote, LoadFullNote, DeleteCurrentNote, UpdateTitle,
    ChangeColorFullNote, GetInvitedUsersToNote, TransformTypeNotes, UpdateLabelFullNote, ChangeTypeFullNote, UploadImagesToNote,
} from './notes-actions';
import { patch, updateItem } from '@ngxs/store/operators';
import { UpdateColor } from './updateColor';
import { OrderService } from 'src/app/shared/services/order.service';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { LabelsOnSelectedNotes } from '../models/labelsOnSelectedNotes';
import { Label } from '../../labels/models/label';
import { UpdateLabelEvent } from './updateLabels';
import { Notes } from './Notes';
import { FullNote } from '../models/fullNote';
import { UpdateLabelCount } from '../../labels/state/labels-actions';
import { InvitedUsersToNoteOrFolder } from '../models/invitedUsersToNote';



interface FullNoteState {
    note: FullNote;
    canView: boolean;
    canEdit: boolean;
}

interface NoteState {
    notes: Notes[];
    fullNoteState: FullNoteState;
    selectedIds: string[];
    labelsIdsFromSelectedIds: LabelsOnSelectedNotes[];
    updateColorEvent: UpdateColor[];
    updateLabelsOnNoteEvent: UpdateLabelEvent[];
    removeFromMurriEvent: string[];
    notesAddingPrivate: SmallNote[];
    selectedLabelsFilter: string[];
    isCanceled: boolean;
    InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
}

@State<NoteState>({
    name: 'Notes',
    defaults: {
        notes: [],
        fullNoteState: null,
        selectedIds: [],
        labelsIdsFromSelectedIds: [],
        updateColorEvent: [],
        updateLabelsOnNoteEvent: [],
        removeFromMurriEvent: [],
        notesAddingPrivate: [],
        selectedLabelsFilter: [],
        isCanceled: false,
        InvitedUsersToNote: []
    }
})

@Injectable()
export class NoteStore {

    constructor(private api: ApiServiceNotes,
                private orderService: OrderService) {
    }

    @Selector()
    static selectedCount(state: NoteState): number {
        return state.selectedIds.length;
    }

    @Selector()
    static getNotes(state: NoteState): Notes[] {
        return state.notes;
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
    static updateLabelOnNoteEvent(state: NoteState): UpdateLabelEvent[] {
        return state.updateLabelsOnNoteEvent;
    }

    @Selector()
    static selectedIds(state: NoteState): string[] {
        return state.selectedIds;
    }

    @Selector()
    static labelsIds(state: NoteState): LabelsOnSelectedNotes[] {
        return state.labelsIdsFromSelectedIds;
    }

    // SHARING

    @Selector()
    static getUsersOnPrivateNote(state: NoteState): InvitedUsersToNoteOrFolder[] {
        return state.InvitedUsersToNote;
    }

    // FULL NOTE


    @Selector()
    static oneFull(state: NoteState): FullNote {
        return state.fullNoteState?.note;
    }


    @Selector()
    static canView(state: NoteState): boolean {
        return state.fullNoteState?.canView;
    }

    @Selector()
    static canNoView(state: NoteState): boolean {
        return !state.fullNoteState?.canView;
    }


    // Get notes

    @Selector()
    static privateNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteTypeENUM.Private).notes;
    }

    @Selector()
    static sharedNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteTypeENUM.Shared).notes;
    }

    @Selector()
    static deletedNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteTypeENUM.Deleted).notes;
    }

    @Selector()
    static archiveNotes(state: NoteState): SmallNote[] {
        return state.notes.find(x => x.typeNotes === NoteTypeENUM.Archive).notes;
    }

    // Get count notes

    @Selector()
    static privateCount(state: NoteState): number {
        const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Private);
        if (state.selectedLabelsFilter.length === 0) {
            return notes.count;
        } else {
            return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
        }
    }

    @Selector()
    static archiveCount(state: NoteState): number {
        const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Archive);
        if (state.selectedLabelsFilter.length === 0) {
            return notes.count;
        } else {
            return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
        }
    }

    @Selector()
    static deletedCount(state: NoteState): number {
        const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Deleted);
        if (state.selectedLabelsFilter.length === 0) {
            return notes.count;
        } else {
            return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
        }
    }

    @Selector()
    static sharedCount(state: NoteState): number {
        const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Shared);
        if (state.selectedLabelsFilter.length === 0) {
            return notes.count;
        } else {
            return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
        }
    }

    static getNotesByTypeStatic(state: NoteState, type: NoteTypeENUM) {
        return state.notes.find(x => x.typeNotes === type);
    }
    static getCountWhenFilteting(notes: SmallNote[], selectedLabelsFilter: string[]) {
        return notes.filter(x => x.labels.some(label => selectedLabelsFilter.some(z => z === label.id))).length;
    }


    @Selector()
    static getSelectedLabelFilter(state: NoteState): string[] {
        return state.selectedLabelsFilter;
    }

    @Selector()
    static getIsCanceled(state: NoteState): boolean {
        return state.isCanceled;
    }


    @Action(AddNote)
    async newNote({ getState, patchState, dispatch }: StateContext<NoteState>) {
        const note = await this.api.new().toPromise();

        const notes = this.getNotesByType(getState, NoteTypeENUM.Private);

        const toUpdate = new Notes(NoteTypeENUM.Private, [note, ...notes]);
        dispatch(new UpdateNotes(toUpdate, NoteTypeENUM.Private));
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
    async changeColor({ patchState, getState, dispatch }: StateContext<NoteState>, { color, typeNote, selectedIds }: ChangeColorNote) {

        await this.api.changeColor(selectedIds, color).toPromise();

        const notes = this.getNotesByType(getState, typeNote.name);

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
        dispatch([new UpdateNotes(new Notes(typeNote.name, newNotes), typeNote.name), UnSelectAllNote, ClearColorNotes]);
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
    async deleteNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote, selectedIds }: SetDeleteNotes) {
        await this.api.setDeleteNotes(selectedIds).toPromise();
        dispatch(new TransformTypeNotes(typeNote.name, NoteTypeENUM.Deleted, selectedIds));
    }

    // Deleting
    @Action(DeleteNotesPermanently)
    async deleteNotesPermanently({ getState, dispatch, patchState }: StateContext<NoteState>,
                                 { selectedIds, typeNote }: DeleteNotesPermanently) {
        await this.api.deleteNotes(selectedIds).toPromise();

        const notesFrom = this.getNotesByType(getState, NoteTypeENUM.Deleted);
        const notesFromNew = notesFrom.filter(x => this.itemNoFromFilterArray(selectedIds, x));
        dispatch(new UpdateNotes(new Notes(NoteTypeENUM.Deleted, notesFromNew), NoteTypeENUM.Deleted));

        patchState({
            removeFromMurriEvent: [...selectedIds]
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }


    // Archive
    @Action(ArchiveNotes)
    async archiveNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote, selectedIds }: ArchiveNotes) {
        await this.api.archiveNotes(selectedIds).toPromise();
        dispatch(new TransformTypeNotes(typeNote.name, NoteTypeENUM.Archive, selectedIds));
    }


    @Action(MakePrivateNotes)
    async makePrivateNotes({ getState, patchState, dispatch }: StateContext<NoteState>, { typeNote, selectedIds }: MakePrivateNotes) {
        await this.api.makePrivateNotes(selectedIds).toPromise();
        dispatch(new TransformTypeNotes(typeNote.name, NoteTypeENUM.Private, selectedIds));
    }

    getNotesByType(getState: () => NoteState, type: NoteTypeENUM): SmallNote[] {
        return getState().notes.find(z => z.typeNotes === type).notes;
    }

    @Action(TransformTypeNotes)
    tranformFromTo({ getState, patchState, dispatch }: StateContext<NoteState>, { typeFrom, typeTo, selectedIds }: TransformTypeNotes) {

        const notesFrom = this.getNotesByType(getState, typeFrom);
        const notesFromNew = notesFrom.filter(x => this.itemNoFromFilterArray(selectedIds, x));

        let notesAdded = notesFrom.filter(x => this.itemsFromFilterArray(selectedIds, x));
        dispatch(new UpdateNotes(new Notes(typeFrom, notesFromNew), typeFrom));

        const notesTo = this.getNotesByType(getState, typeTo);

        notesAdded = [...notesAdded.map(note => {
            const newNote = { ...note };
            newNote.noteType = { ...newNote.noteType };
            return newNote;
        })];
        notesAdded.forEach(note => note.noteType.name = typeTo);
        const newNotesTo = [...notesAdded, ...notesTo];
        dispatch(new UpdateNotes(new Notes(typeTo, newNotesTo), typeTo));

        patchState({
            removeFromMurriEvent: [...selectedIds],
        });
        dispatch([UnSelectAllNote, RemoveFromDomMurri]);
    }

    itemNoFromFilterArray(ids: string[], note: SmallNote) {
        return ids.indexOf(note.id) !== -1 ? false : true;
    }

    itemsFromFilterArray(ids: string[], note: SmallNote) {
        return ids.indexOf(note.id) !== -1 ? true : false;
    }

    @Action(CopyNotes)
    async copyNotes({ getState, dispatch, patchState }: StateContext<NoteState>, { typeNote, selectedIds }: CopyNotes) {
        const newNotes = await this.api.copyNotes(selectedIds).toPromise();
        const privateNotes = this.getNotesByType(getState, NoteTypeENUM.Private);
        dispatch(new UpdateNotes(new Notes(NoteTypeENUM.Private, [...newNotes, ...privateNotes]), NoteTypeENUM.Private));
        dispatch([UnSelectAllNote]);

        if (typeNote.name === NoteTypeENUM.Private) {
            patchState({
                notesAddingPrivate: [...newNotes]
            });
            dispatch(ClearAddedPrivateNotes);
        }
    }

    @Action(ClearUpdatelabelEvent)
    clearUpdateEventLabel({ patchState }: StateContext<NoteState>) {
        patchState({
            updateLabelsOnNoteEvent: []
        });
    }

    // LABELS ADD
    addLabelOnNote(notes: SmallNote[], label: Label, patchState: (val: Partial<NoteState>) => NoteState) {

        const labelUpdate: UpdateLabelEvent[] = [];
        const labelsArray: LabelsOnSelectedNotes[] = [];
        notes.forEach(x => {
            if (!x.labels.some(z => z.id === label.id)) {
                x.labels = [...x.labels,
                { id: label.id, color: label.color, name: label.name, isDeleted: label.isDeleted, countNotes: 0 }];
                labelUpdate.push({ id: x.id, labels: x.labels });
            }
            labelsArray.push({
                labelsIds: [...x.labels.map(z => z.id)],
                id: x.id
            });
        });
        patchState({ updateLabelsOnNoteEvent: labelUpdate });
        return labelsArray;
    }

    @Action(AddLabelOnNote)
    async addLabel({ getState, dispatch, patchState }: StateContext<NoteState>, { label, typeNote, selectedIds }: AddLabelOnNote) {
        await this.api.addLabel(label.id, selectedIds).toPromise();
        const notes = this.getNotesByType(getState, typeNote.name);

        const notesForUpdate = notes.filter(x => this.itemsFromFilterArray(selectedIds, x))
            .map(note => { note = { ...note }; return note; });
        const labelsArray = this.addLabelOnNote(notesForUpdate, label, patchState);
        patchState({ labelsIdsFromSelectedIds: [...labelsArray] });

        const notesForStore = notes.map(note => {
            note = { ...note };
            if (selectedIds.indexOf(note.id) !== -1) {
                if (!note.labels.some(z => z.id === label.id)) {
                    note.labels = [...note.labels,
                    {
                        id: label.id, color: label.color, name: label.name,
                        isDeleted: label.isDeleted, countNotes: 0
                    }];
                }
            }
            return note;
        });
        dispatch(new UpdateNotes(new Notes(typeNote.name, notesForStore), typeNote.name));
        dispatch(new UpdateLabelCount(label));
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
        patchState({ updateLabelsOnNoteEvent: labelUpdate });
        return labelsArray;
    }

    @Action(RemoveLabelFromNote)
    async removeLabel({ getState, dispatch, patchState }: StateContext<NoteState>, { label, typeNote, selectedIds }: RemoveLabelFromNote) {

        await this.api.removeLabel(label.id, getState().selectedIds).toPromise();

        const notes = this.getNotesByType(getState, typeNote.name);

        const notesForUpdate = notes.filter(x => this.itemsFromFilterArray(selectedIds, x))
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
        dispatch(new UpdateNotes(new Notes(typeNote.name, notesForStore), typeNote.name));
        dispatch(new UpdateLabelCount(label));
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

            // FULL NOTE UPDATE
            const fullNote = getState().fullNoteState;
            if (fullNote) {
                const newNote = this.updateFullNoteLabel(fullNote.note, label);
                patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
            }
        }
        patchState({ updateLabelsOnNoteEvent: labelUpdate });
    }

    updateLabel(note: SmallNote, label: Label): SmallNote {
        const noteLabels = [...note.labels];
        const index = noteLabels.findIndex(x => x.id === label.id);
        noteLabels[index] = { ...label };
        const updateNote: SmallNote = { ...note, labels: noteLabels };
        return updateNote;
    }

    updateFullNoteLabel(note: FullNote, label: Label): FullNote {
        const noteLabels = [...note.labels];
        const index = noteLabels.findIndex(x => x.id === label.id);
        noteLabels[index] = { ...label };
        const newNote: FullNote = { ...note, labels: noteLabels };
        return newNote;
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
    async changePosition({ getState, dispatch }: StateContext<NoteState>, { order, typeNote }: PositionNote) {

        let notes = this.getNotesByType(getState, typeNote.name);
        const changedNote = notes.find(x => x.id === order.entityId);
        const flag = notes.indexOf(changedNote);
        if (flag + 1 !== order.position) {
            await this.orderService.changeOrder(order).toPromise();
            notes = notes.filter(x => x.id !== order.entityId);
            notes.splice(order.position - 1, 0, changedNote);
            dispatch(new UpdateNotes(new Notes(typeNote.name, [...notes]), typeNote.name));
        }
    }


    @Action(UpdateOneNote)
    updateOneSmallNote({ dispatch, getState }: StateContext<NoteState>, { note, typeNote }: UpdateOneNote) {
        let notes = this.getNotesByType(getState, typeNote);
        notes = notes.map(nt => {
            if (nt.id === note.id) {
                nt = { ...note };
            }
            return nt;
        });
        dispatch(new UpdateNotes(new Notes(typeNote, [...notes]), typeNote));
    }

    // FULL NOTE

    @Action(LoadFullNote)
    async loadFull({ setState, getState, patchState }: StateContext<NoteState>, { id }: LoadFullNote) {
        const request = await this.api.get(id).toPromise();
        patchState({
            fullNoteState: {
                canView: request.canView,
                canEdit: request.caEdit,
                note: request.fullNote
            }
        });
    }

    @Action(DeleteCurrentNote)
    deleteCurrentNote({ setState, getState, patchState }: StateContext<NoteState>) {
        patchState({ fullNoteState: null });
    }


    @Action(UpdateLabelFullNote)
    async updateLabelFullNote({ getState, patchState, dispatch }: StateContext<NoteState>, { label, remove }: UpdateLabelFullNote) {
        const note = getState().fullNoteState.note;
        let newNote: FullNote = { ...note, labels: [...note.labels, label] };
        if (remove) {
            await this.api.removeLabel(label.id, [note.id]).toPromise();
            newNote = { ...note, labels: note.labels.filter(z => z.id !== label.id) };
            patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
        } else {
            await this.api.addLabel(label.id, [note.id]).toPromise();
            newNote = { ...note, labels: [...note.labels, label] };
            patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
        }
        const noteUpdate = newNote as SmallNote;
        dispatch(new UpdateOneNote(noteUpdate, note.noteType.name));
    }

    @Action(UpdateTitle)
    async updateTitle({ getState, patchState, dispatch }: StateContext<NoteState>, { str }: UpdateTitle) {
        const note = getState().fullNoteState.note;
        const newNote: FullNote = { ...note, title: str };
        patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
        await this.api.updateTitle(str, note.id).toPromise();
        const noteUpdate = newNote as SmallNote;
        dispatch(new UpdateOneNote(noteUpdate, note.noteType.name));
    }

    @Action(ChangeColorFullNote)
    async changeColorFullNote({ getState, patchState, dispatch }: StateContext<NoteState>, { color }: ChangeColorFullNote) {

        await this.api.changeColor([getState().fullNoteState.note.id], color).toPromise();

        const note = getState().fullNoteState.note;
        const newNote: FullNote = { ...note, color };
        patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
        const noteUpdate = newNote as SmallNote;
        dispatch(new UpdateOneNote(noteUpdate, note.noteType.name));
    }

    @Action(ChangeTypeFullNote)
    async changeTypeFullNote({ getState, patchState, dispatch }: StateContext<NoteState>, { type }: ChangeTypeFullNote) {
        const note = getState().fullNoteState?.note;
        if (note) {
            const newNote: FullNote = { ...note, noteType: type };
            patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
        }
    }


    // SHARING

    @Action(GetInvitedUsersToNote)
    async getInvitedUsersToNote({ getState, patchState, dispatch }: StateContext<NoteState>, { noteId }: GetInvitedUsersToNote) {
        const users = await this.api.getUsersOnPrivateNote(noteId).toPromise();
        patchState({
            InvitedUsersToNote: users
        });
    }




    // LOADING SMALL

    @Action(LoadNotes)
    async loadNotes({ getState, patchState }: StateContext<NoteState>, { id, type }: LoadNotes) {
        if (!getState().notes.find(z => z.typeNotes === type.name)) {
            const notesAPI = await this.api.getNotes(id, type.name).toPromise();
            patchState({
                notes: [...getState().notes, notesAPI]
            });
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
        const notes = this.getNotesByType(getState, typeNote.name);
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

    @Action(CancelAllSelectedLabels)
    cancelAllSelectedLabels({ patchState, getState }: StateContext<NoteState>, { isCanceled }: CancelAllSelectedLabels) {
        patchState({ selectedLabelsFilter: [], isCanceled });
    }

    @Action(UpdateSelectLabel)
    updateSelectLabel({ patchState, getState, dispatch }: StateContext<NoteState>, { id }: UpdateSelectLabel) {
        const labels = getState().selectedLabelsFilter;
        const flag = labels.find(x => x === id);
        if (flag) {
            const newLabels = labels.filter(x => x !== id);
            patchState({ selectedLabelsFilter: newLabels });
            if (newLabels.length === 0) {
                dispatch(new CancelAllSelectedLabels(true));
            }
        } else {
            patchState({ selectedLabelsFilter: [...labels, id] });
        }
    }

    @Action(UploadImagesToNote)
    async uploadImagesToNote({ patchState, getState, dispatch }: StateContext<NoteState>, { data }: UploadImagesToNote) {
        const id = getState().fullNoteState.note.id;
        if (id) {
            const resp = await this.api.uploadImagesToNote(data, id).toPromise();
        }
    }
}
