/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable class-methods-use-this */
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { Injectable, NgZone } from '@angular/core';
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
  DeleteCurrentNoteData,
  UpdateNoteTitle,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  UpdateFullNote,
  LoadOnlineUsersOnNote,
  AddToDomNotes,
  LoadSnapshotNote,
  ResetNotes,
  ChangeTypeNote,
  AddNotes,
  PatchUpdatesUINotes,
  UpdatePositionsRelatedNotes,
  SetFolderNotes,
  LoadNoteHistories,
  RemoveOnlineUsersOnNote,
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
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { ApiRelatedNotesService } from '../api-related-notes.service';
import { AddNotesToDom } from './add-notes-to-dom.model';
import { NoteHistory } from '../full-note/models/history/note-history.model';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

export interface FullNoteState {
  note: FullNote;
  isLocked: boolean;
  isCanView: boolean;
}

interface NoteState {
  notes: Notes[];
  fullNoteState: FullNoteState;
  fullNoteHistories: NoteHistory[];
  snapshotState: NoteSnapshotState;
  selectedIds: string[];
  updateNoteEvent: UpdateNoteUI[];
  removeFromMurriEvent: string[];
  notesAddingToDom: AddNotesToDom;
  selectedLabelsFilter: string[];
  isCanceled: boolean;
  InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
  onlineUsers: OnlineUsersNote[];
  folderNotes: SmallNote[];
}

@State<NoteState>({
  name: 'Notes',
  defaults: {
    notes: [],
    fullNoteState: null,
    fullNoteHistories: null,
    snapshotState: null,
    selectedIds: [],
    updateNoteEvent: [],
    removeFromMurriEvent: [],
    notesAddingToDom: null,
    selectedLabelsFilter: [],
    isCanceled: false,
    InvitedUsersToNote: [],
    onlineUsers: [],
    folderNotes: [],
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
    private updaterEntitiesService: UpdaterEntitiesService,
    private apiRelated: ApiRelatedNotesService,
    private zone: NgZone,
    private snackbarService: SnackbarService,
    private translate: TranslateService
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
      const note = state.notes.flatMap((x) => x.notes).find((n) => n.id === id);
      return note.isLockedNow;
    }
    return false;
  }

  @Selector()
  static isCanBeForceLockNotes(state: NoteState) {
    if (state.selectedIds.length === 1) {
      const { 0: id } = state.selectedIds;
      const note = state.notes.flatMap((x) => x.notes).find((n) => n.id === id);
      return !note?.isLockedNow && note?.isLocked;
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
    return state.notes
      .flatMap((x) => x.notes)
      .filter((note) => state.selectedIds.some((q) => q === note.id));
  }

  @Selector()
  static getSelectedFolderNotes(state: NoteState): SmallNote[] {
    return state.folderNotes.filter((note) => state.selectedIds.some((q) => q === note.id));
  }

  @Selector()
  static getAllSelectedFolderNotesCanEdit(state: NoteState): boolean {
    return this.getSelectedFolderNotes(state).every((x) => x.isCanEdit);
  }

  @Selector()
  static getAllSelectedNotesCanEdit(state: NoteState): boolean {
    return this.getSelectedNotes(state).every((x) => x.isCanEdit);
  }

  @Selector()
  static getAllSelectedNotesNoShared(state: NoteState): boolean {
    return this.getSelectedNotes(state).every((x) => x.noteTypeId !== NoteTypeENUM.Shared);
  }

  @Selector()
  static getAllSelectedFullFolderNotesNoShared(state: NoteState): boolean {
    return this.getSelectedFolderNotes(state).every((x) => x.noteTypeId !== NoteTypeENUM.Shared);
  }

  @Selector()
  static getAllSelectedNotesUnlocked(state: NoteState): boolean {
    return this.getSelectedNotes(state).every((x) => !x.isLocked);
  }

  @Selector()
  static getAllSelectedNotesUnlockedNow(state: NoteState): boolean {
    return this.getSelectedNotes(state).every((x) => !x.isLockedNow);
  }

  @Selector()
  static getAllSelectedNotesAuthors(state: NoteState): string[] {
    return [...new Set(this.getSelectedNotes(state).map((x) => x.userId))];
  }

  @Selector()
  static getAllSelectedFullFolderNotesAuthors(state: NoteState): string[] {
    return [...new Set(this.getSelectedFolderNotes(state).map((x) => x.userId))];
  }

  @Selector()
  static getSmallNotes(state: NoteState): SmallNote[] {
    return state.notes.flatMap((x) => x.notes);
  }

  @Selector()
  static activeMenu(state: NoteState): boolean {
    return state.selectedIds?.length > 0;
  }

  @Selector()
  static notesAddingToDOM(state: NoteState): AddNotesToDom {
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
    const notes = [...this.getSelectedNotes(state), ...this.getSelectedFolderNotes(state)];
    const labelIds = notes
      .map((x) => x.labels)
      .flat()
      .map((x) => x.id);
    return [...new Set<string>(labelIds)];
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
  static histories(state: NoteState): NoteHistory[] {
    return state.fullNoteHistories;
  }

  @Selector()
  static fullNoteTitle(state: NoteState): string {
    return state.fullNoteState?.note?.title;
  }

  @Selector()
  static fullNoteType(state: NoteState): NoteTypeENUM {
    return state.fullNoteState?.note?.noteTypeId;
  }

  @Selector()
  static canEdit(state: NoteState): boolean {
    return state.fullNoteState?.note?.isCanEdit;
  }

  @Selector()
  static canView(state: NoteState): boolean {
    return state.fullNoteState?.isCanView;
  }

  @Selector()
  static fullNoteState(state: NoteState): FullNoteState {
    return state.fullNoteState;
  }

  @Selector()
  static isLocked(state: NoteState): boolean {
    return state.fullNoteState?.isLocked;
  }

  @Selector()
  static getOwnerId(state: NoteState): string {
    return state.fullNoteState?.note.userId;
  }

  @Selector()
  static isCanForceLocked(state: NoteState): boolean {
    return !state.fullNoteState?.note?.isLockedNow && state.fullNoteState?.note?.isLocked;
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

  @Action(SetFolderNotes)
  async setFolderNotes({ patchState }: StateContext<NoteState>, { notes }: SetFolderNotes) {
    patchState({ folderNotes: notes });
  }

  @Action(CreateNote)
  async newNote({ getState, dispatch }: StateContext<NoteState>) {
    const res = await this.api.new().toPromise();
    if(res.success) {
      const note = res.data;
      const notes = this.getNotesByType(getState, NoteTypeENUM.Private);
      const toUpdate = new Notes(NoteTypeENUM.Private, [note, ...notes]);
      await dispatch(new UpdateNotes(toUpdate, NoteTypeENUM.Private)).toPromise();
      this.zone.run(() => this.router.navigate([`notes/${note.id}`]));
      return;
    }
    if(!res.success && res.status === OperationResultAdditionalInfo.BillingError){
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, null, null, 5000);
    }
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

  @Action(PatchUpdatesUINotes)
  // eslint-disable-next-line class-methods-use-this
  patchUpdatesUINotes({ patchState }: StateContext<NoteState>, { updates }: PatchUpdatesUINotes) {
    patchState({ updateNoteEvent: updates });
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
    { typeTo, selectedIds, isAddToDom, refTypeId, deleteIds }: TransformTypeNotes,
  ) {
    const typeFrom = getState()
      .notes.map((x) => x.notes)
      .flat()
      .find((q) => selectedIds.some((x) => x === q.id)).noteTypeId;

    const notesFrom = this.getNotesByType(getState, typeFrom);
    const notesFromNew = notesFrom.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
    dispatch(new UpdateNotes(new Notes(typeFrom, notesFromNew), typeFrom));

    let notesAdded = notesFrom.filter((x) =>
      this.itemsFromFilterArray(deleteIds ?? selectedIds, x),
    );
    let notesTo = this.getNotesByType(getState, typeTo).map((x) => ({ ...x }));
    notesTo.forEach((x) => (x.order = x.order + notesAdded.length));

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

    // UPDATE FULL NOTE
    const idToUpdate = selectedIds.find((id) => id === getState().fullNoteState?.note?.id);
    if (idToUpdate) {
      dispatch(new UpdateFullNote({ noteTypeId: typeTo, refTypeId }, idToUpdate));
    }

    // UPDATE POSITIONS
    notesTo = this.getNotesByType(getState, typeTo);
    const positions = notesTo.map(
      (x) => ({ entityId: x.id, position: x.order } as PositionEntityModel),
    );
    dispatch(new UpdatePositionsNotes(positions));

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });
    dispatch([UnSelectAllNote, RemoveFromDomMurri]); // TODO REMOVE FROM HERE

    if (isAddToDom) {
      const obj: AddNotesToDom = { notes: notesAdded };
      dispatch(new AddToDomNotes(obj));
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
          dispatch(
            new TransformTypeNotes(
              NoteTypeENUM.Deleted,
              selectedIds,
              isAddingToDom,
              null,
              resp.data,
            ),
          );
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
      // UPDATE FULL NOTE
      const fullNote = getState().fullNoteState?.note;
      if (fullNote && selectedIds.some((id) => id === fullNote.id)) {
        patchState({
          fullNoteState: { ...getState().fullNoteState, note: { ...fullNote, color } },
        });
      }
      // UPDATE SMALL NOTES
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      if (notesForUpdate && notesForUpdate.length > 0) {
        notesForUpdate.forEach((note) => dispatch(new UpdateOneNote({ ...note, color })));
      }

      // UPDATE UI
      const updatesUI = selectedIds.map((id) =>
        this.toUpdateNoteUI(id, color, null, null, null, null),
      );
      patchState({ updateNoteEvent: updatesUI });
      dispatch([UnSelectAllNote]);
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(CopyNotes)
  async copyNotes(
    { getState, dispatch }: StateContext<NoteState>,
    { selectedIds, pr, folderId }: CopyNotes,
  ) {
    const operation = this.longTermOperationsHandler.addNewCopingOperation('uploader.copyNotes');
    const mini = this.longTermOperationsHandler.getNewMini(
      operation,
      LongTermsIcons.Export,
      'copying',
      true,
      true,
    );

    const resp = await this.api.copyNotes(selectedIds, mini, operation, folderId).toPromise();
    if (resp.eventBody.success && getState().notes.length > 0) {
      const newIds = resp.eventBody.data;
      const newNotes = await this.api.getNotesMany(newIds, pr).toPromise();
      const privateNotes = this.getNotesByType(getState, NoteTypeENUM.Private);
      dispatch(
        new UpdateNotes(
          new Notes(NoteTypeENUM.Private, [...newNotes, ...privateNotes]),
          NoteTypeENUM.Private,
        ),
      );
      const obj: AddNotesToDom = { type: NoteTypeENUM.Private, notes: [...newNotes] };
      dispatch(new AddToDomNotes(obj));
    }
    if(!resp.eventBody.success && resp.eventBody.status === OperationResultAdditionalInfo.BillingError){
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, null, null, 5000);
    }
    dispatch([UnSelectAllNote, LoadUsedDiskSpace]);
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
      // UPDATE FULL NOTE
      const note = getState().fullNoteState?.note;
      if (note && selectedIds.some((id) => id === note.id)) {
        patchState({
          fullNoteState: {
            ...getState().fullNoteState,
            note: { ...note, labels: [...note.labels, label] },
          },
        });
      }
      // UPDATE SMALL NOTES
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      notesForUpdate.forEach((x) => {
        if (!x.labels.some((q) => q.id === label.id)) {
          x.labels = [...x.labels, label];
        }
      });
      notesForUpdate.forEach((x) => dispatch(new UpdateOneNote(x)));
      dispatch([new UpdateLabelCount(label.id)]);

      // UPDATE UI
      const updatesUI = selectedIds.map((id) =>
        this.toUpdateNoteUI(id, null, null, [label], null, null),
      );
      patchState({ updateNoteEvent: updatesUI });
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
      // UPDATE FULL NOTE
      let note = getState().fullNoteState?.note;
      if (note && selectedIds.some((id) => id === note.id)) {
        note = { ...note, labels: note.labels.filter((q) => q.id !== labelId) };
        patchState({ fullNoteState: { ...getState().fullNoteState, note } });
      }

      // UPDATE SMALL NOTES
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      notesForUpdate.forEach((x) =>
        dispatch(new UpdateOneNote({ labels: x.labels.filter((z) => z.id !== labelId) })),
      );
      dispatch([new UpdateLabelCount(labelId)]);

      // UPDATE UI
      const updatesUI = selectedIds.map((id) =>
        this.toUpdateNoteUI(id, null, [labelId], null, null, null),
      );
      patchState({ updateNoteEvent: updatesUI });
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
      notesAddingToDom: null,
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
    { positions }: UpdatePositionsNotes,
  ) {
    if (!positions || positions.length === 0) {
      return;
    }

    const resp = await this.api.updateOrder(positions).toPromise();
    if (resp.success) {
      positions.forEach((pos) => {
        const note = this.getNoteById(getState, pos.entityId);
        if (note) {
          note.order = pos.position;
        }
        dispatch(new UpdateOneNote(note));
      });
    }
  }

  @Action(UpdatePositionsRelatedNotes)
  async updateRelationNotePositions(
    {}: StateContext<NoteState>,
    { positions, noteId }: UpdatePositionsRelatedNotes,
  ) {
    if (noteId && positions && positions.length > 0) {
      await this.apiRelated.updateOrder(noteId, positions).toPromise();
    }
  }

  @Action(UpdateOneNote)
  updateOneSmallNote({ dispatch, getState }: StateContext<NoteState>, { note }: UpdateOneNote) {
    for (const noteState of getState().notes) {
      let isUpdate = false;
      const notes = noteState.notes.map((storeNote) => {
        if (storeNote.id === note.id) {
          isUpdate = true;
          return { ...storeNote, ...note };
        }
        return storeNote;
      });
      if (isUpdate) {
        const state = new Notes(note.noteTypeId, [...notes]);
        dispatch(new UpdateNotes(state, note.noteTypeId));
      }
    }
  }

  @Action(LoadFullNote)
  async loadFull({ patchState }: StateContext<NoteState>, { noteId, folderId }: LoadFullNote) {
    const request = await this.api.get(noteId, folderId).toPromise();
    if (request.success) {
      patchState({
        fullNoteState: {
          note: request.data,
          isLocked: false,
          isCanView: true,
        },
      });
    } else if (!request.success && request.status === OperationResultAdditionalInfo.ContentLocked) {
      patchState({
        fullNoteState: {
          note: null,
          isLocked: true,
          isCanView: false,
        },
      });
    } else {
      patchState({
        fullNoteState: {
          note: null,
          isLocked: false,
          isCanView: false,
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

  @Action(DeleteCurrentNoteData)
  // eslint-disable-next-line class-methods-use-this
  deleteCurrentNote({ patchState }: StateContext<NoteState>) {
    patchState({ fullNoteState: null, onlineUsers: [] });
  }

  @Action(UpdateNoteTitle)
  async updateTitle(
    { getState, patchState, dispatch }: StateContext<NoteState>,
    {
      diffs,
      newTitle,
      isCallApi,
      noteId,
      errorPermissionMessage,
      isUpdateFullNote,
    }: UpdateNoteTitle,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.apiText.updateTitle(diffs, newTitle, noteId).toPromise();
    }
    if (resp.success) {
      // UPDATE FULL NOTE
      if (isUpdateFullNote) {
        const fullNote = getState().fullNoteState?.note;
        if (fullNote && fullNote.id === noteId) {
          patchState({
            fullNoteState: { ...getState().fullNoteState, note: { ...fullNote, title: newTitle } },
          });
        }
      }
      // UPDATE SMALL NOTE
      const noteUpdate = this.getNoteById(getState, noteId);
      if (noteUpdate) {
        dispatch(new UpdateOneNote({ ...noteUpdate, title: newTitle }));
      }

      // UPDATE UI
      const uiChanges = this.toUpdateNoteUI(noteId, null, null, null, null, newTitle);
      patchState({ updateNoteEvent: [uiChanges] });
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(UpdateFullNote)
  // eslint-disable-next-line class-methods-use-this
  async changeTypeFullNote(
    { getState, patchState }: StateContext<NoteState>,
    { note, noteId }: UpdateFullNote,
  ) {
    const noteState = getState().fullNoteState?.note;
    if (note && noteId === noteState?.id) {
      const newNote: FullNote = { ...noteState, ...note };
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

  @Action(RemoveOnlineUsersOnNote)
  async removeOnlineUsersOnNote(
    { patchState, getState }: StateContext<NoteState>,
    { entityId, userIdentifier }: RemoveOnlineUsersOnNote,
  ) {
    if (getState().fullNoteState?.note?.id === entityId) {
      patchState({
        onlineUsers: getState().onlineUsers.filter((x) => x.userIdentifier !== userIdentifier),
      });
    }
  }
  // LOADING SMALL

  @Action(LoadNotes)
  async loadNotes({ getState, patchState }: StateContext<NoteState>, { type, pr }: LoadNotes) {
    if (!getState().notes.find((q) => q.typeNotes === type)) {
      const notesAPI = await this.api.getNotes(type, pr).toPromise();
      patchState({
        notes: [...getState().notes, notesAPI],
      });
      // process unlocked;
      const notesToUpdate = notesAPI.notes.filter(
        (x) => x.isLocked && !x.isLockedNow && x.unlockedTime,
      );
      notesToUpdate.forEach((note) => this.updaterEntitiesService.lockNoteAfter(note.id));
    }
  }

  @Action(LoadNoteHistories)
  async loadNoteHistories({ patchState }: StateContext<NoteState>, { noteId }: LoadNoteHistories) {
    if (!noteId) return;
    patchState({ fullNoteHistories: [] });
    const resp = await this.historyApi.getHistory(noteId).toPromise();
    if (resp.success) {
      patchState({ fullNoteHistories: resp.data });
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

  toUpdateNoteUI = (
    id: string,
    color: string,
    removeLabelIds: string[],
    addLabels: Label[],
    labels: Label[],
    title: string,
  ) => {
    const obj = new UpdateNoteUI(id);
    obj.color = color;
    obj.removeLabelIds = removeLabelIds;
    obj.allLabels = labels;
    obj.addLabels = addLabels;
    obj.title = title;
    return obj;
  };

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
