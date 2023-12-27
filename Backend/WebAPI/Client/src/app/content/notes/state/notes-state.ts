/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable class-methods-use-this */
import { State, Selector, StateContext, Action, Store } from '@ngxs/store';
import { Injectable, NgZone } from '@angular/core';
import { append, patch, updateItem } from '@ngxs/store/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import {
  OperationResult,
  OperationResultAdditionalInfo,
} from 'src/app/shared/models/operation-result.model';
import { ShowSnackNotification, UpdateEditorSyncStatus } from 'src/app/core/stateApp/app-action';
import { ApiServiceNotes } from '../api-notes.service';
import {
  LoadNotes,
  CreateNote,
  ChangeColorNote,
  SelectIdsNote,
  UnSelectIdsNote,
  UnSelectAllNote,
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
  UpdateNoteTitleWS,
  CreateNoteCompleted,
  UpdateFolderNotes,
  LoadNotesByIds,
  UpdateNoteTitleState,
  ResetNotesState,
  LoadNotesCount,
  UpdateNotesCount,
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
import { LongTermOperationsHandlerService } from '../../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermsIcons } from '../../long-term-operations-handler/models/long-terms.icons';
import { Router } from '@angular/router';
import { NoteSnapshot } from '../full-note/models/history/note-snapshot.model';
import { PositionEntityModel } from '../models/position-note.model';
import { ApiRelatedNotesService } from '../api-related-notes.service';
import { AddNotesToDom } from './add-notes-to-dom.model';
import { NoteHistory } from '../full-note/models/history/note-history.model';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { ClearCursorsAction, UpdateCursorAction, UpdateCursorWS } from './editor-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ApiNoteEditorService } from 'src/app/editor/api/api-editor-content.service';
import { UpdateCursor } from 'src/app/editor/entities/cursors/cursor';
import { NoteUserCursorWS } from 'src/app/editor/entities/ws/note-user-cursor';
import { ApiEditorUsersService } from 'src/app/editor/api/api-editor-users.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SignalRService } from 'src/app/core/signal-r.service';
import { NotesCount } from '../models/notes-count.model';
import { VersionUpdateResult } from 'src/app/core/models/entity/version-update-result';

export interface FullNoteState {
  note: FullNote;
  isCanView: boolean;
}

interface NoteState {
  notes: Notes[];
  fullNoteState: FullNoteState | null;
  fullNoteHistories: NoteHistory[] | null;
  snapshotState: NoteSnapshotState | null;
  selectedIds: Set<string>;
  updateNoteEvent: UpdateNoteUI[];
  removeFromMurriEvent: string[];
  notesAddingToDom: AddNotesToDom | null;
  selectedLabelsFilter: string[];
  isCanceled: boolean;
  InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
  onlineUsers: OnlineUsersNote[];
  folderNotes: SmallNote[];
  cursors: NoteUserCursorWS[];
  cursorColor: string | null;
  notesCount: NotesCount[];
}

@State<NoteState>({
  name: 'Notes',
  defaults: {
    notes: [],
    fullNoteState: null,
    fullNoteHistories: null,
    snapshotState: null,
    selectedIds: new Set(),
    updateNoteEvent: [],
    removeFromMurriEvent: [],
    notesAddingToDom: null,
    selectedLabelsFilter: [],
    isCanceled: false,
    InvitedUsersToNote: [],
    onlineUsers: [],
    folderNotes: [],
    cursors: [],
    cursorColor: null,
    notesCount: []
  },
})
@Injectable()
export class NoteStore {
  constructor(
    private api: ApiServiceNotes,
    private apiEditorUsers: ApiEditorUsersService,
    private historyApi: ApiNoteHistoryService,
    private apiNoteEditor: ApiNoteEditorService,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private router: Router,
    private apiRelated: ApiRelatedNotesService,
    private zone: NgZone,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
    public pService: PersonalizationService,
    private store: Store,
    private signalR: SignalRService,
  ) { }

  static getNotesByTypeStatic(state: NoteState, type: NoteTypeENUM) {
    return state.notes.find((x) => x.typeNotes === type);
  }

  static getCountWhenFilteting(notes: SmallNote[], selectedLabelsFilter: string[]) {
    if(!notes) return 0;
    return notes?.filter((x) =>
      x.labelIds?.some((id) => selectedLabelsFilter.some((q) => q === id)),
    ).length ?? 0;
  }

  @Selector([AppStore.isNoteInner])
  static isFullNoteAndCanView(noteState: NoteState, isInnerNote: boolean) {
    return noteState.fullNoteState?.isCanView === isInnerNote
  }

  @Selector()
  static selectedCount(state: NoteState): number {
    return state.selectedIds?.size;
  }

  @Selector()
  static getNotes(state: NoteState): Notes[] {
    return state.notes;
  }

  @Selector()
  static getNotesCount(state: NoteState): NotesCount[] {
    return state.notesCount;
  }

  @Selector()
  static getPrivateNotes(state: NoteState): SmallNote[] {
    return this.getNotesByTypeStatic(state, NoteTypeENUM.Private)?.notes;
  }

  @Selector()
  static getSelectedNotes(state: NoteState): SmallNote[] {
    return state.notes
      .flatMap((x) => x.notes)
      .filter((note) => state.selectedIds?.has(note.id));
  }

  @Selector()
  static getSelectedFolderNotes(state: NoteState): SmallNote[] {
    return state.folderNotes.filter((note) => state.selectedIds?.has(note.id));
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
    return state.selectedIds?.size > 0;
  }

  @Selector()
  static notesAddingToDOM(state: NoteState): AddNotesToDom | null {
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
  static selectedIds(state: NoteState): Set<string> {
    return state.selectedIds;
  }

  @Selector()
  static labelsIds(state: NoteState): string[] {
    const notes = [...this.getSelectedNotes(state), ...this.getSelectedFolderNotes(state)];
    const labelIds = notes
      .map((x) => x.labelIds)
      .flat()
      .map((id) => id);
    return [...new Set<string>(labelIds)];
  }

  // SHARING

  @Selector()
  static getUsersOnPrivateNote(state: NoteState): InvitedUsersToNoteOrFolder[] {
    return state.InvitedUsersToNote;
  }

  @Selector()
  static getOnlineUsersOnNote(state: NoteState): OnlineUsersNote[] {
    return state.onlineUsers?.map((x) => {
      const f = { ...x };
      f.color = state.cursors?.find((q) => x.userId === q.userId)?.color;
      return f;
    });
  }

  // FULL NOTE

  @Selector()
  static oneFull(state: NoteState): FullNote | undefined {
    return state.fullNoteState?.note;
  }

  @Selector()
  static fullNoteShared(state: NoteState): boolean {
    return state.fullNoteState?.note?.noteTypeId === NoteTypeENUM.Shared;
  }

  @Selector()
  static cursorColor(state: NoteState): string | null {
    return state.cursorColor;
  }

  @Selector()
  static isFullNoteViewer(state: NoteState): boolean {
    return state.fullNoteState?.note?.refTypeId === RefTypeENUM.Viewer;
  }

  @Selector()
  static isFullNoteEditor(state: NoteState): boolean {
    return state.fullNoteState?.note?.refTypeId === RefTypeENUM.Editor;
  }

  @Selector()
  static histories(state: NoteState): NoteHistory[] | null {
    return state.fullNoteHistories;
  }

  @Selector()
  static fullNoteTitle(state: NoteState): string | undefined {
    return state.fullNoteState?.note?.title;
  }

  @Selector()
  static cursors(state: NoteState): NoteUserCursorWS[] {
    const noteId = state.fullNoteState?.note?.id;
    if (noteId) {
      return state.cursors.filter((x) => noteId === x.noteId);
    }
    return [];
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
  static getOwnerId(state: NoteState): string {
    return state.fullNoteState?.note.userId;
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
    const type = NoteTypeENUM.Private;
    if (state.selectedLabelsFilter.length !== 0) {
      const notes = this.getNotesByTypeStatic(state, type);
      if(!notes) return 0;
      return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
    }
    const notesCount = state.notesCount.find(x => x.noteTypeId === type);
    return notesCount?.count ?? 0;
  }

  @Selector()
  static archiveCount(state: NoteState): number {
    const type = NoteTypeENUM.Archive;
    if (state.selectedLabelsFilter.length !== 0) {
      const notes = this.getNotesByTypeStatic(state, type);
      if(!notes) return 0;
      return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
    }
    const notesCount = state.notesCount.find(x => x.noteTypeId === type);
    return notesCount?.count ?? 0;
  }

  @Selector()
  static deletedCount(state: NoteState): number {
    const type = NoteTypeENUM.Deleted;
    if (state.selectedLabelsFilter.length !== 0) {
      const notes = this.getNotesByTypeStatic(state, type);
      if(!notes) return 0;
      return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
    }
    const notesCount = state.notesCount.find(x => x.noteTypeId === type);
    return notesCount?.count ?? 0;
  }

  @Selector()
  static sharedCount(state: NoteState): number {
    const type = NoteTypeENUM.Shared;
    if (state.selectedLabelsFilter.length !== 0) {
      const notes = this.getNotesByTypeStatic(state, type);
      if(!notes) return 0;
      return this.getCountWhenFilteting(notes.notes, state.selectedLabelsFilter);
    }
    const notesCount = state.notesCount.find(x => x.noteTypeId === type);
    return notesCount?.count ?? 0;
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
  async newNote({ getState, dispatch }: StateContext<NoteState>, { navigateToNote }: CreateNote) {
    const res = await this.api.new().toPromise();
    if (res.success) {
      const note = res.data;
      const notes = this.getNotesByType(getState, NoteTypeENUM.Private);
      if (notes) {
        const toUpdate = new Notes(NoteTypeENUM.Private, [note, ...notes]);
        await dispatch(new UpdateNotes(toUpdate, NoteTypeENUM.Private)).toPromise();
      }
      if (navigateToNote) {
        this.zone.run(() => this.router.navigate([`notes/${note.id}`]));
      }
      dispatch([new CreateNoteCompleted(note)]);
      return;
    }
    if (!res.success && res.status === OperationResultAdditionalInfo.BillingError) {
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
  updateSmallNote({ setState, dispatch }: StateContext<NoteState>, { notes, typeNote }: UpdateNotes) {
    setState(
      patch({
        notes: updateItem<Notes>((notess) => notess.typeNotes === typeNote, notes),
      }),
    );
    const newCount = notes.notes?.length ?? 0;
    dispatch(new UpdateNotesCount(newCount, typeNote));
  }

  @Action(UpdateNotesCount)
  // eslint-disable-next-line class-methods-use-this
  updateNotesCount({ setState, getState }: StateContext<NoteState>, { count, typeNote }: UpdateNotesCount) {
    const state = getState().notesCount;
    const typeCount = state.find(x => x.noteTypeId == typeNote);
    if (typeCount) {
      setState(
        patch({
          notesCount: updateItem<NotesCount>((notess) => notess.noteTypeId === typeNote,
            {
              noteTypeId: typeNote,
              count
            }),
        }),
      );
    } else {
      const notesCount = { noteTypeId: typeNote, count } as NotesCount;
      setState(
        patch({
          notesCount: append<NotesCount>([notesCount])
        })
      );
    }
  }


  @Action(UpdateFolderNotes)
  // eslint-disable-next-line class-methods-use-this
  updateFolderNotes({ setState }: StateContext<NoteState>, { updateNote }: UpdateFolderNotes) {
    setState(
      patch({
        folderNotes: updateItem<SmallNote>((note) => note.id === updateNote.id, updateNote),
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

    let folderNotes = getState().folderNotes.filter(q => selectedIds.some((x) => x === q.id));
    folderNotes = folderNotes.map((x, index) => {
      const note = { ...x };
      note.noteTypeId = typeTo;
      note.refTypeId = refTypeId ?? note.refTypeId;
      note.updatedAt = new Date();
      return note;
    });

    folderNotes.forEach(x => dispatch(new UpdateFolderNotes(x)));

    const notes = getState().notes.map((x) => x.notes).flat();
    if (notes?.length <= 0) { return; }

    const typeFrom = notes.find((q) => selectedIds.some((x) => x === q.id))?.noteTypeId;

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
        resp = await this.api.makePublic(refTypeId, selectedIds).toPromise();
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
    let resp: OperationResult<VersionUpdateResult[]> = { success: true, data: null, message: null };
    if (isCallApi) {
      if (!this.signalR.connectionId) {
        throw new Error('connectionId null');
      }
      resp = await this.api.changeColor(selectedIds, color, this.signalR.connectionId).toPromise();
    }
    if (resp.success) {
      // UPDATE FULL NOTE
      const fullNote = getState().fullNoteState?.note;
      if (fullNote && selectedIds.some((id) => id === fullNote.id)) {
        const version = resp.data.find(x => fullNote.id == x.entityId).version;
        patchState({
          fullNoteState: { ...getState().fullNoteState, note: { ...fullNote, color, version } },
        });
      }
      // UPDATE SMALL NOTES
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      if (notesForUpdate && notesForUpdate.length > 0) {
        notesForUpdate.forEach((note) => {
          const version = resp.data.find(x => note.id == x.entityId).version;
          dispatch(new UpdateOneNote({ ...note, color, version }, note.id));
        });
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
    { dispatch }: StateContext<NoteState>,
    { selectedIds, folderId }: CopyNotes,
  ) {
    const operation = this.longTermOperationsHandler.addNewCopingOperation('uploader.copyNotes');
    const resp = await this.api.copyNotes(selectedIds, operation, folderId).toPromise();
    if (resp && !resp.success
    ) {
      if (resp.status === OperationResultAdditionalInfo.BillingError) {
        const message = this.translate.instant('snackBar.subscriptionCreationError');
        this.snackbarService.openSnackBar(message, null, null, 5000);
      }
      if (resp.status === OperationResultAdditionalInfo.NotEnoughMemory) {
        const message = this.translate.instant('files.noEnoughMemory');
        this.store.dispatch(new ShowSnackNotification(message));
      }
    }

    dispatch([UnSelectAllNote, LoadUsedDiskSpace]);
  }

  @Action(LoadNotesByIds)
  async loadNotesByIds({ dispatch }: StateContext<NoteState>, { ids }: LoadNotesByIds) {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const notes = await this.api.getNotesMany(ids, pr.contentInNoteCount).toPromise();
    await dispatch(new AddNotes(notes, NoteTypeENUM.Private)).toPromise();
  }

  @Action(AddLabelOnNote)
  async addLabel(
    { getState, dispatch, patchState }: StateContext<NoteState>,
    { labelId, selectedIds, isCallApi, errorPermissionMessage }: AddLabelOnNote,
  ) {
    let resp: OperationResult<VersionUpdateResult[]> = { success: true, data: null, message: null };
    if (isCallApi) {
      if (!this.signalR.connectionId) {
        throw new Error('connectionId null');
      }
      resp = await this.api.addLabel(labelId, selectedIds, this.signalR.connectionId).toPromise();
    }
    if (resp.success) {
      // UPDATE FULL NOTE
      const note = getState().fullNoteState?.note;
      if (note && selectedIds.some((id) => id === note.id)) {
        const version = resp.data.find(x => note.id == x.entityId).version;
        patchState({
          fullNoteState: {
            ...getState().fullNoteState,
            note: { ...note, labelIds: [...note.labelIds, labelId], version },
          },
        });
      }
      // UPDATE SMALL NOTES
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      notesForUpdate.forEach((x) => {
        x.version = resp.data.find(x => note.id == x.entityId).version; 
        if (!x.labelIds.some((id) => id === labelId)) {
          x.labelIds = [...x.labelIds, labelId];
        }
      });
      notesForUpdate.forEach((x) => dispatch(new UpdateOneNote(x, x.id)));
      dispatch([new UpdateLabelCount(labelId)]);

      // UPDATE UI
      const updatesUI = selectedIds.map((id) =>
        this.toUpdateNoteUI(id, null, null, [labelId], null, null),
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
    let resp: OperationResult<VersionUpdateResult[]> = { success: true, data: null, message: null };
    if (isCallApi) {
      if (!this.signalR.connectionId) {
        throw new Error('connectionId null');
      }
      resp = await this.api.removeLabel(labelId, selectedIds, this.signalR.connectionId).toPromise();
    }
    if (resp.success) {
      // UPDATE FULL NOTE
      let note = getState().fullNoteState?.note;
      if (note && selectedIds.some((id) => id === note.id)) {
        const version = resp.data.find(x => note.id == x.entityId).version;
        note = { ...note, labelIds: note.labelIds.filter((id) => id !== labelId, version) };
        patchState({ fullNoteState: { ...getState().fullNoteState, note } });
      }

      // UPDATE SMALL NOTES
      const notesForUpdate = this.getNotesByIds(getState, selectedIds);
      notesForUpdate.forEach((x) => {
        const version = resp.data.find(x => note.id == x.entityId).version; 
        dispatch(new UpdateOneNote({ labelIds: x.labelIds.filter((id) => id !== labelId), version }, x.id))
      });
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
        dispatch(new UpdateOneNote(note, note.id));
      });
    }
  }

  @Action(UpdateCursorAction)
  async updateCursor(
    { getState }: StateContext<NoteState>,
    { noteId, cursor }: UpdateCursorAction,
  ) {
    const user = this.store.selectSnapshot(UserStore.getUser);
    if (!user?.id) return;
    const note = getState().fullNoteState.note;
    if (!note || note.id !== noteId) return;
    await this.apiNoteEditor.updateCursorPosition(noteId, cursor, this.signalR.connectionIdOrError).toPromise();
  }

  @Action(ClearCursorsAction)
  async clearCursorsAction({ patchState }: StateContext<NoteState>) {
    patchState({ cursors: [] });
  }

  @Action(UpdateCursorWS)
  async updateCursorWS(
    { getState, patchState }: StateContext<NoteState>,
    { cursor }: UpdateCursorWS,
  ) {
    let cursors = [...getState().cursors];
    const prev = cursors.find((x) => x.noteId === cursor.noteId && x.userId === cursor.userId);
    if (prev) {
      cursors = cursors.filter((x) => x !== prev);
    }
    cursors.push(cursor);
    patchState({ cursors });
  }

  @Action(UpdatePositionsRelatedNotes)
  // eslint-disable-next-line no-empty-pattern
  async updateRelationNotePositions({ }: StateContext<NoteState>, { positions, noteId }: UpdatePositionsRelatedNotes) {
    if (noteId && positions && positions.length > 0) {
      await this.apiRelated.updateOrder(noteId, positions, this.signalR.connectionIdOrError).toPromise();
    }
  }

  @Action(UpdateOneNote)
  updateOneSmallNote(
    { dispatch, getState }: StateContext<NoteState>,
    { note, noteId }: UpdateOneNote,
  ) {
    for (const noteState of getState().notes) {
      let isUpdate = false;
      let noteType: NoteTypeENUM = null;
      const notes = noteState.notes.map((storeNote) => {
        if (storeNote.id === noteId) {
          isUpdate = true;
          noteType = storeNote.noteTypeId;
          return { ...storeNote, ...note };
        }
        return storeNote;
      });
      if (isUpdate && noteType) {
        const state = new Notes(noteType, [...notes]);
        dispatch(new UpdateNotes(state, noteType));
      }
    }
  }

  @Action(LoadNotesCount)
  async loadNotesCount({ patchState }: StateContext<NoteState>) {
    const request = await this.api.getCount().toPromise();
    patchState({
      notesCount: request
    })
  }

  @Action(LoadFullNote)
  async loadFull({ patchState }: StateContext<NoteState>, { noteId, folderId }: LoadFullNote) {
    const request = await this.api.get(noteId, folderId).toPromise();
    if (request.success) {
      patchState({
        fullNoteState: {
          note: request.data,
          isCanView: true,
        },
        cursorColor: UpdateCursor.getRandomBrightColor(),
      });
    } else {
      patchState({
        fullNoteState: {
          note: null,
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
    { newTitle, isCallApi, noteId, errorPermissionMessage }: UpdateNoteTitle,
  ) {
    let resp: OperationResult<VersionUpdateResult> = { success: true, data: null, message: null };
    if (isCallApi) {
      if (!this.signalR.connectionId) {
        throw new Error('connectionId null');
      }
      dispatch(new UpdateEditorSyncStatus(true));
      resp = await this.apiNoteEditor.updateTitle(newTitle, noteId, this.signalR.connectionId).toPromise();
    }
    if (resp.success) {
      // UPDATE FULL NOTE
      const fullNote = getState().fullNoteState?.note;
      if (fullNote && fullNote.id === noteId) {
        patchState({
          fullNoteState: { ...getState().fullNoteState, note: { ...fullNote, title: newTitle, version: resp.data.version  } },
        });
      }
      // UPDATE SMALL NOTE
      const noteUpdate = this.getNoteById(getState, noteId);
      if (noteUpdate) {
        dispatch(new UpdateOneNote({ ...noteUpdate, title: newTitle, version: resp.data.version }, noteUpdate.id));
      }

      // UPDATE UI
      const uiChanges = this.toUpdateNoteUI(noteId, null, null, null, null, newTitle);
      patchState({ updateNoteEvent: [uiChanges] });
    }
    dispatch(new UpdateEditorSyncStatus(false));
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(UpdateNoteTitleWS)
  async updateNoteTitleWS(
    { dispatch }: StateContext<NoteState>,
    { title, noteId }: UpdateNoteTitleWS,
  ) {
    await dispatch(new UpdateNoteTitle(title, noteId, false, null));
  }

  @Action(UpdateNoteTitleState)
  async updateNoteTitleState(
    { dispatch }: StateContext<NoteState>,
    { title, noteId }: UpdateNoteTitleWS,
  ) {
    await dispatch(new UpdateNoteTitle(title, noteId, false, null));
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
    const onlineUsers = await this.apiEditorUsers.getOnlineUsersOnNote(noteId).toPromise();
    patchState({ onlineUsers });
  }

  @Action(RemoveOnlineUsersOnNote)
  async removeOnlineUsersOnNote(
    { patchState, getState, setState }: StateContext<NoteState>,
    { entityId, userIdentifier, userId }: RemoveOnlineUsersOnNote,
  ) {
    if (getState().fullNoteState?.note?.id !== entityId) {
      return;
    }
    const entity = getState().onlineUsers.find((x) => x.userId === userId);
    if (!entity) return;
    const userIdentifiers = entity.userIdentifiers.filter((id) => id !== userIdentifier);
    setState(
      patch({
        onlineUsers: updateItem<OnlineUsersNote>((user) => user.userId === userId, {
          ...entity,
          userIdentifiers,
        }),
      }),
    );
    patchState({
      onlineUsers: getState().onlineUsers.filter((x) => x.userIdentifiers?.length > 0),
    });
  }
  // LOADING SMALL

  @Action(LoadNotes)
  async loadNotes({ getState, patchState }: StateContext<NoteState>, { type, pr }: LoadNotes) {
    if (!getState().notes?.find((q) => q.typeNotes === type)) {
      const notesAPI = await this.api.getNotes(type, pr.contentInNoteCount).toPromise();
      patchState({
        notes: [...getState().notes, notesAPI],
      });
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

  @Action(ResetNotesState)
  async resetNotesState({ patchState }: StateContext<NoteState>) {
    patchState({
      notes: [],
      fullNoteState: null,
      fullNoteHistories: null,
      snapshotState: null,
      selectedIds: new Set(),
      updateNoteEvent: [],
      removeFromMurriEvent: [],
      notesAddingToDom: null,
      selectedLabelsFilter: [],
      isCanceled: false,
      InvitedUsersToNote: [],
      onlineUsers: [],
      folderNotes: [],
      cursors: [],
      cursorColor: null,
    });
  }

  // NOTES SELECTION

  @Action(SelectIdsNote)
  // eslint-disable-next-line class-methods-use-this
  select({ patchState, getState }: StateContext<NoteState>, { ids }: SelectIdsNote) {
    const stateIds = getState().selectedIds;
    patchState({
      selectedIds: new Set([...ids, ...stateIds]),
    });
  }

  @Action(UnSelectIdsNote)
  // eslint-disable-next-line class-methods-use-this
  unSelect({ getState, patchState }: StateContext<NoteState>, { ids }: UnSelectIdsNote) {
    const stateIds = getState().selectedIds;
    ids.forEach(id => stateIds.delete(id));
    patchState({ selectedIds: new Set([...stateIds]) });
  }

  @Action(UnSelectAllNote)
  // eslint-disable-next-line class-methods-use-this
  unselectAll({ patchState }: StateContext<NoteState>) {
    patchState({ selectedIds: new Set() });
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
    addLabelIds: string[],
    labels: string[],
    title: string,
  ) => {
    const obj = new UpdateNoteUI(id);
    obj.color = color;
    obj.removeLabelIds = removeLabelIds;
    obj.allLabels = labels;
    obj.addLabels = addLabelIds;
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
        if (ids.some((q) => q === note.id)) {
          result.push(note);
        }
      }
    });
    return result;
  };

  getNotesByType = (getState: () => NoteState, type: NoteTypeENUM): SmallNote[] => {
    return getState().notes?.find((q) => q.typeNotes === type)?.notes ?? [];
  };

  itemNoFromFilterArray = (ids: string[], note: SmallNote) => {
    return ids.indexOf(note.id) === -1;
  };

  itemsFromFilterArray = (ids: string[], note: SmallNote) => {
    return ids.indexOf(note.id) !== -1;
  };
}
