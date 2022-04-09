/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable class-methods-use-this */
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { patch, updateItem } from '@ngxs/store/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import {
  OperationResult,
  OperationResultAdditionalInfo,
} from 'src/app/shared/models/operation-result.model';
import { ShowSnackNotification } from 'src/app/core/stateApp/app-action';
import { ApiServiceNotes } from '../api-notes.service';
import {
  LoadNotes,
  CreateNote,
  ChangeColorNote,
  SelectIdNote,
  UnSelectIdNote,
  UnSelectAllNote,
  SelectAllNote,
  UpdateNotes,
  ClearUpdatesUINotes,
  DeleteNotesPermanently,
  RemoveFromDomMurri,
  CopyNotes,
  ClearAddToDomNotes,
  CancelAllSelectedLabels,
  UpdateSelectLabel,
  AddLabelOnNote,
  RemoveLabelFromNote,
  UpdateLabelOnNote,
  UpdateOneNote,
  UpdatePositionsNotes,
  LoadFullNote,
  DeleteCurrentNote,
  UpdateNoteTitle,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  ChangeTypeFullNote,
  LoadOnlineUsersOnNote,
  ChangeIsLockedFullNote,
  AddToDomNotes,
  LoadSnapshotNote,
  ResetNotes,
  ChangeTypeNote,
  AddNotes,
} from './notes-actions';
import { UpdateNoteUI } from './update-note-ui.model';
import { SmallNote } from '../models/small-note.model';
import { Label } from '../../labels/models/label.model';
import { Notes } from './notes.model';
import { FullNote } from '../models/full-note.model';
import { UpdateLabelCount } from '../../labels/state/labels-actions';
import { InvitedUsersToNoteOrFolder } from '../models/invited-users-to-note.model';
import { OnlineUsersNote } from '../models/online-users-note.model';
import { NoteSnapshotState } from '../full-note/models/history/note-snapshot-state.model';
import { ApiNoteHistoryService } from '../full-note/services/api-note-history.service';
import { ApiTextService } from '../full-note/services/api-text.service';
import { LongTermOperationsHandlerService } from '../../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermsIcons } from '../../long-term-operations-handler/models/long-terms.icons';
import { Router } from '@angular/router';
import { NoteSnapshot } from '../full-note/models/history/note-snapshot.model';
import { PositionEntityModel } from '../models/position-note.model';

interface FullNoteState {
  note: FullNote;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
  authorId: string;
  isLocked: boolean;
}

interface NoteState {
  notes: Notes[];
  fullNoteState: FullNoteState;
  snapshotState: NoteSnapshotState;
  selectedIds: string[];
  updateNoteEvent: UpdateNoteUI[];
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
    updateNoteEvent: [],
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
    private historyApi: ApiNoteHistoryService,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private router: Router,
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
  static isRemoveLock(state: NoteState) {
    if (state.selectedIds.length === 1) {
      const { 0: id } = state.selectedIds;
      const note = state.notes
        .map((x) => x.notes)
        .reduce((acc, val) => acc.concat(val), [])
        .find((x) => x.id === id);
      return note.isLockedNow;
    }
    if (state.fullNoteState) {
      return state.fullNoteState.note.isLockedNow;
    }
    return false;
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
  static getSelectedNotes(state: NoteState): SmallNote[] {
    return state.notes.flatMap(x => x.notes).filter((note) => state.selectedIds.some(z => z === note.id));
  }

  @Selector()
  static getAllSelectedNotesCanEdit(state: NoteState): boolean {
    return this.getSelectedNotes(state).every(x => x.isCanEdit);
  }

  @Selector()
  static getAllSelectedNotesNoShared(state: NoteState): boolean {
    return this.getSelectedNotes(state).every(x => x.noteTypeId !== NoteTypeENUM.Shared);
  }

  @Selector()
  static getAllSelectedNotesUnlocked(state: NoteState): boolean {
    return this.getSelectedNotes(state).every(x => !x.isLocked);
  }

  @Selector()
  static getAllSelectedNotesUnlockedNow(state: NoteState): boolean {
    return this.getSelectedNotes(state).every(x => !x.isLockedNow);
  }

  @Selector()
  static getAllSelectedNotesAuthors(state: NoteState): string[] {
    return [...new Set(this.getSelectedNotes(state).map(x => x.userId))];
  }

  @Selector()
  static getSmallNotes(state: NoteState): SmallNote[] {
    return state.notes.flatMap(x => x.notes);
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
  static updateNotesEvent(state: NoteState): UpdateNoteUI[] {
    return state.updateNoteEvent;
  }

  @Selector()
  static selectedIds(state: NoteState): string[] {
    return state.selectedIds;
  }

  @Selector()
  static labelsIds(state: NoteState): string[] {
    return this.getSmallNotes(state)
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
  static fullNoteTitle(state: NoteState): string {
    return state.fullNoteState?.note?.title;
  }

  @Selector()
  static canEdit(state: NoteState): boolean {
    return state.fullNoteState?.canEdit;
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
  static isLocked(state: NoteState): boolean {
    return state.fullNoteState?.isLocked;
  }

  @Selector()
  static isCanForceLocked(state: NoteState): boolean {
    return !state.fullNoteState?.note?.isLockedNow && state.fullNoteState?.note?.isLocked;
  }

  @Selector()
  static authorId(state: NoteState): string {
    return state.fullNoteState?.authorId;
  }

  @Selector()
  static snapshotState(state: NoteState): NoteSnapshotState {
    return state.snapshotState;
  }

  @Selector()
  static snapshotNote(state: NoteState): NoteSnapshot {
    return state.snapshotState?.noteSnapshot;
  }

  @Selector()
  static snapshotNoteTitle(state: NoteState): string {
    return state.snapshotState?.noteSnapshot?.title;
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

  @Action(CreateNote)
  async newNote({ getState, dispatch }: StateContext<NoteState>) {
    const note = await this.api.new().toPromise();
    const notes = this.getNotesByType(getState, NoteTypeENUM.Private);
    const toUpdate = new Notes(NoteTypeENUM.Private, [note, ...notes]);
    dispatch(new UpdateNotes(toUpdate, NoteTypeENUM.Private));
    this.router.navigate([`notes/${note.id}`]);
  }

  @Action(AddNotes)
  addNote({ getState, dispatch }: StateContext<NoteState>, { notes, type }: AddNotes) {
    const notesState = this.getNotesByType(getState, type);
    const toUpdate = new Notes(type, [...notes, ...notesState]);
    dispatch(new UpdateNotes(toUpdate, type));
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

  @Action(ClearUpdatesUINotes)
  // eslint-disable-next-line class-methods-use-this
  clearUpdatesNotes({ patchState }: StateContext<NoteState>) {
    patchState({ updateNoteEvent: [] });
  }

  // Deleting
  @Action(DeleteNotesPermanently)
  async deleteNotesPermanently(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { selectedIds, isCallApi }: DeleteNotesPermanently,
  ) {
    if (isCallApi) {
      const resp = await this.api.deleteNotes(selectedIds).toPromise();
      if (!resp.success) {
        return;
      }
    }

    for (const { notes, typeNotes } of getState().notes) {
      const notesFromNew = notes.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
      dispatch(new UpdateNotes(new Notes(typeNotes, notesFromNew), typeNotes));
    }

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });

    dispatch([UnSelectAllNote, RemoveFromDomMurri]);
  }

  @Action(TransformTypeNotes)
  async transformFromTo(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    { typeTo, selectedIds, isAddToDom, refTypeId }: TransformTypeNotes,
  ) {

    const typeFrom = getState()
      .notes.map((x) => x.notes)
      .flat()
      .find((z) => selectedIds.some((x) => x === z.id)).noteTypeId;

    const notesFrom = this.getNotesByType(getState, typeFrom);
    const notesFromNew = notesFrom.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
    dispatch(new UpdateNotes(new Notes(typeFrom, notesFromNew), typeFrom));

    let notesAdded = notesFrom.filter((x) => this.itemsFromFilterArray(selectedIds, x));

    let notesTo = this.getNotesByType(getState, typeTo).map(x => ({...x}));
    notesTo.forEach((x) => x.order = x.order + notesAdded.length);

    notesAdded = notesAdded.map((x, index) => {
      const note = { ...x };
      note.noteTypeId = typeTo;
      note.refTypeId = refTypeId ?? note.refTypeId;
      note.order = index + 1;
      note.updatedAt = new Date();
      return note;
    });

    const newNotesTo = [...notesAdded, ...notesTo];
    await dispatch(new UpdateNotes(new Notes(typeTo, newNotesTo), typeTo)).toPromise();

    notesTo = this.getNotesByType(getState, typeTo);
    const positions = notesTo.map(
      (x) => ({ entityId: x.id, position: x.order } as PositionEntityModel),
    );
    dispatch(new UpdatePositionsNotes(positions));

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });
    dispatch([UnSelectAllNote, RemoveFromDomMurri]);

    if (isAddToDom) {
      dispatch(new AddToDomNotes(notesAdded));
    }
  }

  // change note type

  @Action(ChangeTypeNote)
  async changeTypeNote(
    { dispatch }: StateContext<NoteState>,
    {
      typeTo,
      selectedIds,
      isAddingToDom,
      errorPermissionMessage,
      successCallback,
      refTypeId,
    }: ChangeTypeNote,
  ) {
    let resp: OperationResult<any>;
    switch (typeTo) {
      case NoteTypeENUM.Private: {
        resp = await this.api.makePrivate(selectedIds).toPromise();
        if (resp.success) {
          dispatch(new TransformTypeNotes(NoteTypeENUM.Private, selectedIds, isAddingToDom));
          if (successCallback) {
            successCallback();
          }
        }
        break;
      }
      case NoteTypeENUM.Deleted: {
        resp = await this.api.setDelete(selectedIds).toPromise();
        if (resp.success) {
          dispatch(new TransformTypeNotes(NoteTypeENUM.Deleted, selectedIds, isAddingToDom));
          if (successCallback) {
            successCallback();
          }
        }
        break;
      }
      case NoteTypeENUM.Archive: {
        resp = await this.api.archive(selectedIds).toPromise();
        if (resp.success) {
          dispatch(new TransformTypeNotes(NoteTypeENUM.Archive, selectedIds, isAddingToDom));
          if (successCallback) {
            successCallback();
          }
        }
        break;
      }
      case NoteTypeENUM.Shared: {
        await this.api.makePublic(refTypeId, selectedIds).toPromise();
        dispatch(
          new TransformTypeNotes(NoteTypeENUM.Shared, selectedIds, isAddingToDom, refTypeId),
        );
        break;
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  // Color change
  @Action(ChangeColorNote)
  async changeColor(
    { patchState, getState, dispatch }: StateContext<NoteState>,
    { color, selectedIds, isCallApi, errorPermissionMessage }: ChangeColorNote,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.api.changeColor(selectedIds, color).toPromise();
    }
    if (resp.success) {
      const fullNote = getState().fullNoteState?.note;
      if (fullNote && selectedIds.some((id) => id === fullNote.id)) {
        patchState({
          fullNoteState: { ...getState().fullNoteState, note: { ...fullNote, color } },
        });
      }
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      if (notesForUpdate && notesForUpdate.length > 0) {
        notesForUpdate.forEach((note) => (note.color = color));
        const updatesUI = notesForUpdate.map((note) =>
          this.toUpdateNoteUI(note.id, note.color, null, null, null, null),
        );
        patchState({ updateNoteEvent: updatesUI });
        notesForUpdate.forEach((note) => dispatch(new UpdateOneNote(note)));
        dispatch([UnSelectAllNote]);
      }
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(CopyNotes)
  async copyNotes(
    { getState, dispatch }: StateContext<NoteState>,
    { typeNote, selectedIds, pr }: CopyNotes,
  ) {
    const operation = this.longTermOperationsHandler.addNewCopingOperation('uploader.copyNotes');
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Export,
      'photo changing',
      true,
      true,
    );
    
    const resp = await this.api.copyNotes(selectedIds, mini, operation).toPromise();
    if(resp.eventBody.success){
      const newIds = resp.eventBody.data;
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
  }

  @Action(AddLabelOnNote)
  async addLabel(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { label, selectedIds, isCallApi, errorPermissionMessage }: AddLabelOnNote,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.api.addLabel(label.id, selectedIds).toPromise();
    }
    if (resp.success) {
      const note = getState().fullNoteState?.note;
      if (note && selectedIds.some((id) => id === note.id)) {
        patchState({
          fullNoteState: {
            ...getState().fullNoteState,
            note: { ...note, labels: [...note.labels, label] },
          },
        });
      }
      // Updates small notes
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      const updateNoteEvent: UpdateNoteUI[] = [];
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
              order: 0
            },
          ];
          updateNoteEvent.push(this.toUpdateNoteUI(x.id, null, null, null, x.labels, null));
        }
      });
      patchState({ updateNoteEvent });
      notesForUpdate.forEach((x) => dispatch(new UpdateOneNote(x)));
      dispatch([new UpdateLabelCount(label.id)]);
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(RemoveLabelFromNote)
  async removeLabel(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { labelId, selectedIds, isCallApi, errorPermissionMessage }: RemoveLabelFromNote,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.api.removeLabel(labelId, selectedIds).toPromise();
    }
    if (resp.success) {
      let note = getState().fullNoteState?.note;
      if (note && selectedIds.some((id) => id === note.id)) {
        note = { ...note, labels: note.labels.filter((z) => z.id !== labelId) };
        patchState({ fullNoteState: { ...getState().fullNoteState, note } });
      }
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      const updateNoteEvent: UpdateNoteUI[] = [];
      notesForUpdate.forEach((x: SmallNote) => {
        x.labels = x.labels.filter((z) => z.id !== labelId);
        updateNoteEvent.push(this.toUpdateNoteUI(x.id, null, null, null, x.labels, null));
      });
      patchState({ updateNoteEvent });
      notesForUpdate.forEach((x) => dispatch(new UpdateOneNote(x)));
      dispatch([new UpdateLabelCount(labelId)]);
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(UpdateLabelOnNote)
  updateLabelOnNote(
    { patchState, getState, dispatch }: StateContext<NoteState>,
    { label }: UpdateLabelOnNote,
  ) {
    let updateNoteEvent: UpdateNoteUI[] = [];
    for (const notes of getState().notes) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const notesUpdate = notes.notes.map((x) => {
        let note = { ...x };
        if (note.labels.some((z) => z.id === label.id)) {
          note = this.updateLabel(note, label);
          updateNoteEvent = [
            this.toUpdateNoteUI(note.id, null, null, null, note.labels, null),
            ...updateNoteEvent,
          ];
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
    patchState({ updateNoteEvent });
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

  @Action(UpdatePositionsNotes)
  async changePosition(
    { getState, dispatch }: StateContext<NoteState>,
    { positions}: UpdatePositionsNotes,
  ) {

    if(!positions || positions.length === 0){
      return;
    }

    const resp = await this.api.updateOrder(positions).toPromise();
    if(resp.success){
      positions.forEach(pos => {
        const note = this.getNoteById(getState, pos.entityId);
        if(note){
          note.order = pos.position;
        }
        dispatch(new UpdateOneNote(note));
      });
    }
  }

  @Action(UpdateOneNote)
  updateOneSmallNote({ dispatch, getState }: StateContext<NoteState>, { note }: UpdateOneNote) {
    for (const noteState of getState().notes) {
      let isUpdate = false;
      const notes = noteState.notes.map((x) => {
        let nt = { ...x };
        if (nt.id === note.id) {
          nt = { ...note };
          isUpdate = true;
        }
        return nt;
      });
      if (isUpdate) {
        dispatch(new UpdateNotes(new Notes(note.noteTypeId, [...notes]), note.noteTypeId));
      }
    }
  }

  @Action(LoadFullNote)
  async loadFull({ patchState }: StateContext<NoteState>, { noteId, folderId }: LoadFullNote) {
    const request = await this.api.get(noteId, folderId).toPromise();
    if (request.success) {
      patchState({
        fullNoteState: {
          canView: request.data.canView,
          canEdit: request.data.canEdit,
          note: request.data.fullNote,
          isOwner: request.data.isOwner,
          authorId: request.data.authorId,
          isLocked: false
        },
      });
    }
    if(!request.success && request.status === OperationResultAdditionalInfo.ContentLocked){
      patchState({
        fullNoteState: {
          canView: null,
          canEdit: null,
          note: null,
          isOwner: null,
          authorId: null,
          isLocked: true
        },
      });
    }
  }

  @Action(LoadSnapshotNote)
  async loadSnapshot(
    { patchState }: StateContext<NoteState>,
    { snapshotId, noteId }: LoadSnapshotNote,
  ) {
    const request = await this.historyApi.getSnapshot(noteId, snapshotId).toPromise();
    if (request.success) {
      patchState({
        snapshotState: {
          canView: request.data.canView,
          noteSnapshot: request.data.noteSnapshot,
          isLocked: false,
        },
      });
    }
    if (!request.success && request.status === OperationResultAdditionalInfo.ContentLocked) {
      patchState({
        snapshotState: {
          canView: false,
          noteSnapshot: null,
          isLocked: true,
        },
      });
    }
  }

  @Action(DeleteCurrentNote)
  // eslint-disable-next-line class-methods-use-this
  deleteCurrentNote({ patchState }: StateContext<NoteState>) {
    patchState({ fullNoteState: null });
  }

  @Action(UpdateNoteTitle)
  async updateTitle(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    { str, isCallApi, noteId, errorPermissionMessage }: UpdateNoteTitle,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.apiText.updateTitle(str, noteId).toPromise();
    }
    if (resp.success) {
      const fullNote = getState().fullNoteState?.note;
      if (fullNote && fullNote.id === noteId) {
        patchState({
          fullNoteState: { ...getState().fullNoteState, note: { ...fullNote, title: str } },
        });
      }
      const noteUpdate = this.getNoteById(getState, noteId);
      if (noteUpdate) {
        noteUpdate.title = str;
        patchState({
          updateNoteEvent: [
            this.toUpdateNoteUI(noteUpdate.id, null, null, null, null, noteUpdate.title),
          ],
        });
        dispatch(new UpdateOneNote(noteUpdate));
      }
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
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
      const newNote: FullNote = { ...note, isLockedNow: isLocked }; // TOOD
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

  @Action(ResetNotes)
  async resetNotes({ patchState }: StateContext<NoteState>) {
    patchState({
      notes: [],
    });
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

  getNoteById = (getState: () => NoteState, id: string): SmallNote => {
    for (const notes of getState().notes) {
      for (const x of notes.notes) {
        const note = { ...x };
        if (id === note.id) {
          return note;
        }
      }
    }
    return null;
  };

  getNotesByIds = (getState: () => NoteState, ids: string[]): SmallNote[] => {
    const result: SmallNote[] = [];
    getState().notes.forEach((notes) => {
      for (const x of notes.notes) {
        const note = { ...x };
        if (ids.some((z) => z === note.id)) {
          result.push(note);
        }
      }
    });
    return result;
  };

  toUpdateNoteUI = (
    id: string,
    color: string,
    removeLabelIds: string[],
    addLabels: Label[],
    labels: Label[],
    title: string,
  ) => {
    const obj = new UpdateNoteUI();
    obj.id = id;
    obj.color = color;
    obj.removeLabelIds = removeLabelIds;
    obj.allLabels = labels;
    obj.addLabels = addLabels;
    obj.title = title;
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
