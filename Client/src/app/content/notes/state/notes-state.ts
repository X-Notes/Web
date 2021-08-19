import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { patch, updateItem } from '@ngxs/store/operators';
import { OrderService } from 'src/app/shared/services/order.service';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { ApiServiceNotes } from '../api-notes.service';
import {
  LoadNotes,
  AddNote,
  ChangeColorNote,
  SelectIdNote,
  UnSelectIdNote,
  UnSelectAllNote,
  SelectAllNote,
  UpdateNotes,
  ClearColorNotes,
  SetDeleteNotes,
  DeleteNotesPermanently,
  ArchiveNotes,
  RemoveFromDomMurri,
  MakePrivateNotes,
  CopyNotes,
  ClearAddToDomNotes,
  CancelAllSelectedLabels,
  UpdateSelectLabel,
  AddLabelOnNote,
  RemoveLabelFromNote,
  ClearUpdatelabelEvent,
  UpdateLabelOnNote,
  UpdateOneNote,
  PositionNote,
  LoadFullNote,
  DeleteCurrentNote,
  UpdateTitle,
  ChangeColorFullNote,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  UpdateLabelFullNote,
  ChangeTypeFullNote,
  LoadOnlineUsersOnNote,
  UpdateOneFullNote,
  ChangeIsLockedFullNote,
  AddToDomNotes,
  MakeSharedNotes,
  LoadSnapshotNote,
} from './notes-actions';
import { UpdateColor } from './update-color.model';
import { SmallNote } from '../models/small-note.model';
import { Label } from '../../labels/models/label.model';
import { UpdateLabelEvent } from './update-labels.model';
import { Notes } from './notes.model';
import { FullNote } from '../models/full-note.model';
import { UpdateLabelCount } from '../../labels/state/labels-actions';
import { InvitedUsersToNoteOrFolder } from '../models/invited-users-to-note.model';
import { OnlineUsersNote } from '../models/online-users-note.model';
import { NoteSnapshotState } from '../full-note/models/history/note-snapshot-state.model';
import { ApiNoteHistoryService } from '../full-note/services/api-note-history.service';
import { ApiTextService } from '../full-note/services/api-text.service';

interface FullNoteState {
  note: FullNote;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
  authorId: string;
}

interface NoteState {
  notes: Notes[];
  fullNoteState: FullNoteState;
  snapshotState: NoteSnapshotState;
  selectedIds: string[];
  updateColorEvent: UpdateColor[];
  updateLabelsOnNoteEvent: UpdateLabelEvent[];
  removeFromMurriEvent: string[];
  notesAddingToDom: SmallNote[];
  selectedLabelsFilter: string[];
  isCanceled: boolean;
  InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
  onlineUsers: OnlineUsersNote[];
}

@State<NoteState>({
  name: 'Notes',
  defaults: {
    notes: [],
    fullNoteState: null,
    snapshotState: null,
    selectedIds: [],
    updateColorEvent: [],
    updateLabelsOnNoteEvent: [],
    removeFromMurriEvent: [],
    notesAddingToDom: [],
    selectedLabelsFilter: [],
    isCanceled: false,
    InvitedUsersToNote: [],
    onlineUsers: [],
  },
})
@Injectable()
export class NoteStore {
  constructor(
    private api: ApiServiceNotes,
    private apiText: ApiTextService,
    private orderService: OrderService,
    private historyApi: ApiNoteHistoryService,
  ) {}

  static getNotesByTypeStatic(state: NoteState, type: NoteTypeENUM) {
    return state.notes.find((x) => x.typeNotes === type);
  }

  static getCountWhenFilteting(notes: SmallNote[], selectedLabelsFilter: string[]) {
    return notes.filter((x) =>
      x.labels.some((label) => selectedLabelsFilter.some((z) => z === label.id)),
    ).length;
  }

  @Selector()
  static getNote(state: NoteState) {
    return (id: string, type: NoteTypeENUM) => {
      console.log(id, type);
      const note = this.getNotesByTypeStatic(state, type).notes.find((x) => x.id === id);
      return note;
    };
  }

  @Selector()
  static isRemoveLock(state: NoteState) {
    if (state.selectedIds.length === 1) {
      const { 0: id } = state.selectedIds;
      const note = state.notes
        .map((x) => x.notes)
        .reduce((acc, val) => acc.concat(val), [])
        .find((x) => x.id === id);
      return note.isLocked;
    }
    if (state.fullNoteState) {
      return state.fullNoteState.note.isLocked;
    }
    return false;
  }

  @Selector()
  static concatedAllNotes(state: NoteState) {
    let newArr: SmallNote[] = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < state.notes.length; i += 1) {
      newArr = newArr.concat(state.notes[i].notes);
    }
    return newArr;
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
    return state.selectedIds?.length > 0;
  }

  @Selector()
  static notesAddingToDOM(state: NoteState): SmallNote[] {
    return state.notesAddingToDom;
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
  static labelsIds(state: NoteState): string[] {
    return this.concatedAllNotes(state)
      .filter((note) => state.selectedIds.some((id) => id === note.id))
      .map((x) => x.labels)
      .flat()
      .map((x) => x.id);
  }

  // SHARING

  @Selector()
  static getUsersOnPrivateNote(state: NoteState): InvitedUsersToNoteOrFolder[] {
    return state.InvitedUsersToNote;
  }

  @Selector()
  static getOnlineUsersOnNote(state: NoteState): OnlineUsersNote[] {
    return state.onlineUsers;
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

  @Selector() // TODO REMOVE
  static canNoView(state: NoteState): boolean {
    return !state.fullNoteState?.canView;
  }

  @Selector()
  static isOwner(state: NoteState): boolean {
    return state.fullNoteState?.isOwner;
  }

  @Selector()
  static authorId(state: NoteState): string {
    return state.fullNoteState?.authorId;
  }

  @Selector()
  static snapshotState(state: NoteState): NoteSnapshotState {
    return state.snapshotState;
  }

  // Get notes

  @Selector()
  static privateNotes(state: NoteState): SmallNote[] {
    return state.notes.find((x) => x.typeNotes === NoteTypeENUM.Private).notes;
  }

  @Selector()
  static sharedNotes(state: NoteState): SmallNote[] {
    return state.notes.find((x) => x.typeNotes === NoteTypeENUM.Shared).notes;
  }

  @Selector()
  static deletedNotes(state: NoteState): SmallNote[] {
    return state.notes.find((x) => x.typeNotes === NoteTypeENUM.Deleted).notes;
  }

  @Selector()
  static archiveNotes(state: NoteState): SmallNote[] {
    return state.notes.find((x) => x.typeNotes === NoteTypeENUM.Archive).notes;
  }

  // Get count notes

  @Selector()
  static privateCount(state: NoteState): number {
    const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Private);
    if (state.selectedLabelsFilter.length === 0) {
      return notes.count;
    }
    return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
  }

  @Selector()
  static archiveCount(state: NoteState): number {
    const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Archive);
    if (state.selectedLabelsFilter.length === 0) {
      return notes.count;
    }
    return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
  }

  @Selector()
  static deletedCount(state: NoteState): number {
    const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Deleted);
    if (state.selectedLabelsFilter.length === 0) {
      return notes.count;
    }
    return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
  }

  @Selector()
  static sharedCount(state: NoteState): number {
    const notes = this.getNotesByTypeStatic(state, NoteTypeENUM.Shared);
    if (state.selectedLabelsFilter.length === 0) {
      return notes.count;
    }
    return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
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
  async newNote({ getState, dispatch }: StateContext<NoteState>) {
    const note = await this.api.new().toPromise();

    const notes = this.getNotesByType(getState, NoteTypeENUM.Private);

    const toUpdate = new Notes(NoteTypeENUM.Private, [note, ...notes]);
    dispatch(new UpdateNotes(toUpdate, NoteTypeENUM.Private));
  }

  @Action(UpdateNotes)
  // eslint-disable-next-line class-methods-use-this
  updateSmallNote({ setState }: StateContext<NoteState>, { notes, typeNote }: UpdateNotes) {
    setState(
      patch({
        notes: updateItem<Notes>((notess) => notess.typeNotes === typeNote, notes),
      }),
    );
  }

  @Action(ClearColorNotes)
  // eslint-disable-next-line class-methods-use-this
  clearColorNotes({ patchState }: StateContext<NoteState>) {
    patchState({ updateColorEvent: [] });
  }

  // Deleting
  @Action(DeleteNotesPermanently)
  async deleteNotesPermanently(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { selectedIds }: DeleteNotesPermanently,
  ) {
    await this.api.deleteNotes(selectedIds).toPromise();

    const notesFrom = this.getNotesByType(getState, NoteTypeENUM.Deleted);
    const notesFromNew = notesFrom.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
    dispatch(new UpdateNotes(new Notes(NoteTypeENUM.Deleted, notesFromNew), NoteTypeENUM.Deleted));

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });
    dispatch([UnSelectAllNote, RemoveFromDomMurri]);
  }

  @Action(TransformTypeNotes)
  tranformFromTo(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    { typeTo, selectedIds, isAddToDom, refTypeId }: TransformTypeNotes,
  ) {
    const typeFrom = getState()
      .notes.map((x) => x.notes)
      .flat()
      .find((z) => selectedIds.some((x) => x === z.id)).noteTypeId;

    const notesFrom = this.getNotesByType(getState, typeFrom);
    const notesFromNew = notesFrom.filter((x) => this.itemNoFromFilterArray(selectedIds, x));

    let notesAdded = notesFrom.filter((x) => this.itemsFromFilterArray(selectedIds, x));
    dispatch(new UpdateNotes(new Notes(typeFrom, notesFromNew), typeFrom));

    const notesTo = this.getNotesByType(getState, typeTo);

    notesAdded = [
      ...notesAdded.map((note) => {
        const newNote = { ...note };
        return newNote;
      }),
    ];
    notesAdded = notesAdded.map((x) => {
      const note = { ...x };
      note.noteTypeId = typeTo;
      note.refTypeId = refTypeId ?? note.refTypeId;
      return note;
    });

    const newNotesTo = [...notesAdded, ...notesTo];
    dispatch(new UpdateNotes(new Notes(typeTo, newNotesTo), typeTo));

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });
    dispatch([UnSelectAllNote, RemoveFromDomMurri]);

    if (isAddToDom) {
      dispatch(new AddToDomNotes(notesAdded));
    }
  }

  // Set deleting
  @Action(SetDeleteNotes)
  async deleteNotes(
    { dispatch }: StateContext<NoteState>,
    { selectedIds, isAddingToDom }: SetDeleteNotes,
  ) {
    await this.api.setDeleteNotes(selectedIds).toPromise();
    dispatch(new TransformTypeNotes(NoteTypeENUM.Deleted, selectedIds, isAddingToDom));
  }

  @Action(ArchiveNotes)
  async archiveNotes(
    { dispatch }: StateContext<NoteState>,
    { selectedIds, isAddingToDom }: ArchiveNotes,
  ) {
    await this.api.archiveNotes(selectedIds).toPromise();
    dispatch(new TransformTypeNotes(NoteTypeENUM.Archive, selectedIds, isAddingToDom));
  }

  @Action(MakePrivateNotes)
  async makePrivateNotes(
    { dispatch }: StateContext<NoteState>,
    { selectedIds, isAddingToDom }: MakePrivateNotes,
  ) {
    await this.api.makePrivateNotes(selectedIds).toPromise();
    dispatch(new TransformTypeNotes(NoteTypeENUM.Private, selectedIds, isAddingToDom));
  }

  @Action(MakeSharedNotes)
  async makeSharedNotes(
    { dispatch }: StateContext<NoteState>,
    { selectedIds, isAddingToDom, refTypeId }: MakeSharedNotes,
  ) {
    await this.api.makePublic(refTypeId, selectedIds).toPromise();
    dispatch(new TransformTypeNotes(NoteTypeENUM.Shared, selectedIds, isAddingToDom, refTypeId));
  }

  // Color change
  @Action(ChangeColorNote)
  async changeColor(
    { patchState, getState, dispatch }: StateContext<NoteState>,
    { color, selectedIds }: ChangeColorNote,
  ) {
    await this.api.changeColor(selectedIds, color).toPromise();

    for (const notes of getState().notes) {
      const newNotes = notes.notes.map((x) => {
        const note = { ...x };
        if (selectedIds.some((z) => z === note.id)) {
          note.color = color;
        }
        return note;
      });

      const notesForUpdate = notes.notes
        .filter((x) => selectedIds.some((z) => z === x.id))
        .map((x) => {
          const note = { ...x, color };
          return note;
        });
      const updateColor = notesForUpdate.map((note) => this.mapFromNoteToUpdateColor(note));
      patchState({ updateColorEvent: updateColor });
      dispatch([
        new UpdateNotes(new Notes(notes.typeNotes, newNotes), notes.typeNotes),
        UnSelectAllNote,
        ClearColorNotes,
      ]);
    }
  }

  @Action(CopyNotes)
  async copyNotes(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { typeNote, selectedIds, pr }: CopyNotes,
  ) {
    const newIds = await this.api.copyNotes(selectedIds).toPromise();
    const newNotes = await this.api.getNotesMany(newIds, pr).toPromise();
    const privateNotes = this.getNotesByType(getState, NoteTypeENUM.Private);
    dispatch(
      new UpdateNotes(
        new Notes(NoteTypeENUM.Private, [...newNotes, ...privateNotes]),
        NoteTypeENUM.Private,
      ),
    );
    dispatch([UnSelectAllNote]);

    if (typeNote === NoteTypeENUM.Private) {
      dispatch(new AddToDomNotes([...newNotes]));
    }
  }

  @Action(ClearUpdatelabelEvent)
  // eslint-disable-next-line class-methods-use-this
  clearUpdateEventLabel({ patchState }: StateContext<NoteState>) {
    patchState({
      updateLabelsOnNoteEvent: [],
    });
  }

  @Action(AddLabelOnNote)
  async addLabel(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { label, typeNote, selectedIds }: AddLabelOnNote,
  ) {
    await this.api.addLabel(label.id, selectedIds).toPromise();
    const notes = this.getNotesByType(getState, typeNote);

    const notesForUpdate = notes
      .filter((x) => this.itemsFromFilterArray(selectedIds, x))
      .map((note) => {
        return { ...note };
      });

    const labelUpdate: UpdateLabelEvent[] = [];
    notesForUpdate.forEach((x) => {
      if (!x.labels.some((z) => z.id === label.id)) {
        // eslint-disable-next-line no-param-reassign
        x.labels = [
          ...x.labels,
          {
            id: label.id,
            color: label.color,
            name: label.name,
            isDeleted: label.isDeleted,
            countNotes: 0,
          },
        ];
        labelUpdate.push({ id: x.id, labels: x.labels });
      }
    });
    patchState({ updateLabelsOnNoteEvent: labelUpdate });

    const notesForStore = notes.map((x) => {
      const note = { ...x };
      if (selectedIds.indexOf(note.id) !== -1) {
        if (!note.labels.some((z) => z.id === label.id)) {
          note.labels = [
            ...note.labels,
            {
              id: label.id,
              color: label.color,
              name: label.name,
              isDeleted: label.isDeleted,
              countNotes: 0,
            },
          ];
        }
      }
      return note;
    });
    dispatch(new UpdateNotes(new Notes(typeNote, notesForStore), typeNote));
    dispatch(new UpdateLabelCount(label));
  }

  @Action(RemoveLabelFromNote)
  async removeLabel(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { label, typeNote, selectedIds }: RemoveLabelFromNote,
  ) {
    await this.api.removeLabel(label.id, getState().selectedIds).toPromise();

    const notes = this.getNotesByType(getState, typeNote);

    const notesForUpdate = notes.filter((x) => this.itemsFromFilterArray(selectedIds, x));

    const labelUpdate: UpdateLabelEvent[] = [];
    notesForUpdate.forEach((x: SmallNote) => {
      // eslint-disable-next-line no-param-reassign
      const labels = x.labels.filter((z) => z.id !== label.id);
      labelUpdate.push({ id: x.id, labels });
    });

    patchState({ updateLabelsOnNoteEvent: labelUpdate });

    const notesForStore = notes.map((x) => {
      const note = { ...x };
      if (selectedIds.indexOf(note.id) !== -1) {
        note.labels = note.labels.filter((z) => z.id !== label.id);
      }
      return note;
    });
    dispatch(new UpdateNotes(new Notes(typeNote, notesForStore), typeNote));
    dispatch(new UpdateLabelCount(label));
  }

  @Action(UpdateLabelOnNote)
  updateLabelOnNote(
    { patchState, getState, dispatch }: StateContext<NoteState>,
    { label }: UpdateLabelOnNote,
  ) {
    let labelUpdate: UpdateLabelEvent[] = [];
    for (const notes of getState().notes) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const notesUpdate = notes.notes.map((x) => {
        let note = { ...x };
        if (note.labels.some((z) => z.id === label.id)) {
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

  @Action(RemoveFromDomMurri)
  // eslint-disable-next-line class-methods-use-this
  removeFromDomMurri({ patchState }: StateContext<NoteState>) {
    patchState({
      removeFromMurriEvent: [],
    });
  }

  @Action(ClearAddToDomNotes)
  // eslint-disable-next-line class-methods-use-this
  clearAddedPrivateNotesEvent({ patchState }: StateContext<NoteState>) {
    patchState({
      notesAddingToDom: [],
    });
  }

  @Action(AddToDomNotes)
  // eslint-disable-next-line class-methods-use-this
  addAddedPrivateNotes({ patchState }: StateContext<NoteState>, { notes }: AddToDomNotes) {
    patchState({
      notesAddingToDom: notes,
    });
  }

  @Action(PositionNote)
  async changePosition(
    { getState, dispatch }: StateContext<NoteState>,
    { order, typeNote }: PositionNote,
  ) {
    let notes = this.getNotesByType(getState, typeNote).map((x) => ({ ...x }));
    const changedNote = notes.find((x) => x.id === order.entityId);
    const flag = notes.indexOf(changedNote);
    if (flag + 1 !== order.position) {
      const resp = await this.orderService.changeOrder(order).toPromise();
      resp.forEach((z) => {
        const indexOf = notes.findIndex((x) => x.id === z.entityId);
        notes[indexOf].order = z.newOrder;
      });
      dispatch(new UpdateNotes(new Notes(typeNote, [...notes]), typeNote));
    }
  }

  @Action(UpdateOneFullNote)
  // eslint-disable-next-line class-methods-use-this
  updateOneFullNote(
    { patchState, getState }: StateContext<NoteState>,
    { note }: UpdateOneFullNote,
  ) {
    patchState({ fullNoteState: { ...getState().fullNoteState, note } });
  }

  @Action(UpdateOneNote)
  updateOneSmallNote(
    { dispatch, getState }: StateContext<NoteState>,
    { note, typeNote }: UpdateOneNote,
  ) {
    let notes = this.getNotesByType(getState, typeNote);
    notes = notes.map((x) => {
      let nt = { ...x };
      if (nt.id === note.id) {
        nt = { ...note };
      }
      return nt;
    });
    dispatch(new UpdateNotes(new Notes(typeNote, [...notes]), typeNote));
  }

  @Action(LoadFullNote)
  async loadFull({ patchState }: StateContext<NoteState>, { id }: LoadFullNote) {
    const request = await this.api.get(id).toPromise();
    patchState({
      fullNoteState: {
        canView: request.canView,
        canEdit: request.caEdit,
        note: request.fullNote,
        isOwner: request.isOwner,
        authorId: request.authorId,
      },
    });
  }

  @Action(LoadSnapshotNote)
  async loadSnapshot(
    { patchState }: StateContext<NoteState>,
    { snapshotId, noteId }: LoadSnapshotNote,
  ) {
    const request = await this.historyApi.getSnapshot(noteId, snapshotId).toPromise();
    patchState({
      snapshotState: {
        canView: request.canView,
        noteSnapshot: request.noteSnapshot,
      },
    });
  }

  @Action(DeleteCurrentNote)
  // eslint-disable-next-line class-methods-use-this
  deleteCurrentNote({ patchState }: StateContext<NoteState>) {
    patchState({ fullNoteState: null });
  }

  @Action(UpdateLabelFullNote)
  async updateLabelFullNote(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    { label, remove }: UpdateLabelFullNote,
  ) {
    const { note } = getState().fullNoteState;
    let newNote: FullNote = { ...note, labels: [...note.labels, label] };
    if (remove) {
      await this.api.removeLabel(label.id, [note.id]).toPromise();
      newNote = { ...note, labels: note.labels.filter((z) => z.id !== label.id) };
      patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
    } else {
      await this.api.addLabel(label.id, [note.id]).toPromise();
      newNote = { ...note, labels: [...note.labels, label] };
      patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
    }
    const noteUpdate = newNote as SmallNote;
    dispatch(new UpdateOneNote(noteUpdate, note.noteTypeId));
  }

  @Action(UpdateTitle)
  async updateTitle(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    { str }: UpdateTitle,
  ) {
    const { note } = getState().fullNoteState;
    const newNote: FullNote = { ...note, title: str };
    patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
    await this.apiText.updateTitle(str, note.id).toPromise();
    const noteUpdate = newNote as SmallNote;
    dispatch(new UpdateOneNote(noteUpdate, note.noteTypeId));
  }

  @Action(ChangeColorFullNote)
  async changeColorFullNote(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    { color }: ChangeColorFullNote,
  ) {
    await this.api.changeColor([getState().fullNoteState.note.id], color).toPromise();

    const { note } = getState().fullNoteState;
    const newNote: FullNote = { ...note, color };
    patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
    const noteUpdate = newNote as SmallNote;
    dispatch(new UpdateOneNote(noteUpdate, note.noteTypeId));
  }

  @Action(ChangeTypeFullNote)
  // eslint-disable-next-line class-methods-use-this
  async changeTypeFullNote(
    { getState, patchState }: StateContext<NoteState>,
    { type }: ChangeTypeFullNote,
  ) {
    const note = getState().fullNoteState?.note;
    if (note) {
      const newNote: FullNote = { ...note, noteTypeId: type };
      patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
    }
  }

  @Action(ChangeIsLockedFullNote)
  // eslint-disable-next-line class-methods-use-this
  async changeIsLockedFullNote(
    { getState, patchState }: StateContext<NoteState>,
    { isLocked }: ChangeIsLockedFullNote,
  ) {
    const note = getState().fullNoteState?.note;
    if (note) {
      const newNote: FullNote = { ...note, isLocked };
      patchState({ fullNoteState: { ...getState().fullNoteState, note: newNote } });
    }
  }

  @Action(GetInvitedUsersToNote)
  async getInvitedUsersToNote(
    { patchState }: StateContext<NoteState>,
    { noteId }: GetInvitedUsersToNote,
  ) {
    const users = await this.api.getUsersOnPrivateNote(noteId).toPromise();
    patchState({
      InvitedUsersToNote: users,
    });
  }

  @Action(LoadOnlineUsersOnNote)
  async loadOnlineUsersOnNote(
    { patchState }: StateContext<NoteState>,
    { noteId }: LoadOnlineUsersOnNote,
  ) {
    patchState({ onlineUsers: [] });
    const onlineUsers = await this.api.getOnlineUsersOnNote(noteId).toPromise();
    patchState({ onlineUsers });
  }
  // LOADING SMALL

  @Action(LoadNotes)
  async loadNotes({ getState, patchState }: StateContext<NoteState>, { type, pr }: LoadNotes) {
    if (!getState().notes.find((z) => z.typeNotes === type)) {
      const notesAPI = await this.api.getNotes(type, pr).toPromise();
      patchState({
        notes: [...getState().notes, notesAPI],
      });
    }
  }

  // NOTES SELECTION

  @Action(SelectIdNote)
  // eslint-disable-next-line class-methods-use-this
  select({ patchState, getState }: StateContext<NoteState>, { id }: SelectIdNote) {
    const ids = getState().selectedIds;
    patchState({
      selectedIds: [id, ...ids],
    });
  }

  @Action(UnSelectIdNote)
  // eslint-disable-next-line class-methods-use-this
  unSelect({ getState, patchState }: StateContext<NoteState>, { id }: UnSelectIdNote) {
    let ids = getState().selectedIds;
    ids = ids.filter((x) => x !== id);
    patchState({ selectedIds: [...ids] });
  }

  @Action(UnSelectAllNote)
  // eslint-disable-next-line class-methods-use-this
  unselectAll({ patchState }: StateContext<NoteState>) {
    patchState({ selectedIds: [] });
  }

  @Action(SelectAllNote)
  selectAll({ patchState, getState }: StateContext<NoteState>, { typeNote }: SelectAllNote) {
    const notes = this.getNotesByType(getState, typeNote);
    const ids = notes.map((z) => z.id);
    patchState({ selectedIds: [...ids] });
  }

  @Action(CancelAllSelectedLabels)
  // eslint-disable-next-line class-methods-use-this
  cancelAllSelectedLabels(
    { patchState }: StateContext<NoteState>,
    { isCanceled }: CancelAllSelectedLabels,
  ) {
    patchState({ selectedLabelsFilter: [], isCanceled });
  }

  @Action(UpdateSelectLabel)
  // eslint-disable-next-line class-methods-use-this
  updateSelectLabel(
    { patchState, getState, dispatch }: StateContext<NoteState>,
    { id }: UpdateSelectLabel,
  ) {
    const labels = getState().selectedLabelsFilter;
    const flag = labels.find((x) => x === id);
    if (flag) {
      const newLabels = labels.filter((x) => x !== id);
      patchState({ selectedLabelsFilter: newLabels });
      if (newLabels.length === 0) {
        dispatch(new CancelAllSelectedLabels(true));
      }
    } else {
      patchState({ selectedLabelsFilter: [...labels, id] });
    }
  }

  mapFromNoteToUpdateColor = (note: SmallNote) => {
    const obj: UpdateColor = {
      id: note.id,
      color: note.color,
    };
    return obj;
  };

  getNotesByType = (getState: () => NoteState, type: NoteTypeENUM) => {
    return getState().notes.find((z) => z.typeNotes === type).notes;
  };

  itemNoFromFilterArray = (ids: string[], note: SmallNote) => {
    return ids.indexOf(note.id) === -1;
  };

  itemsFromFilterArray = (ids: string[], note: SmallNote) => {
    return ids.indexOf(note.id) !== -1;
  };

  updateLabel = (note: SmallNote, label: Label) => {
    const noteLabels = [...note.labels];
    const index = noteLabels.findIndex((x) => x.id === label.id);
    noteLabels[index] = { ...label };
    const updateNote: SmallNote = { ...note, labels: noteLabels };
    return updateNote;
  };

  updateFullNoteLabel = (note: FullNote, label: Label) => {
    const noteLabels = [...note.labels];
    const index = noteLabels.findIndex((x) => x.id === label.id);
    noteLabels[index] = { ...label };
    const newNote: FullNote = { ...note, labels: noteLabels };
    return newNote;
  };
}
