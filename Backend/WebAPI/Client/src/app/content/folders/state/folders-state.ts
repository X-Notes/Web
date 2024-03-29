/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable, NgZone } from '@angular/core';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { append, patch, updateItem } from '@ngxs/store/operators';
import {
  OperationResult,
  OperationResultAdditionalInfo,
} from 'src/app/shared/models/operation-result.model';
import { ShowSnackNotification } from 'src/app/core/stateApp/app-action';
import { SmallFolder } from '../models/folder.model';
import { ApiFoldersService } from '../api-folders.service';
import { FullFolder } from '../models/full-folder.model';
import {
  LoadFolders,
  CreateFolder,
  SelectIdFolder,
  UnSelectIdFolder,
  UnSelectAllFolder,
  SelectAllFolder,
  ChangeTypeFolder,
  RemoveFromDomMurri,
  ChangeColorFolder,
  ClearUpdatesUIFolders,
  DeleteFoldersPermanently,
  CopyFolders,
  ClearAddToDomFolders,
  UpdatePositionsFolders,
  UpdateFolders,
  UpdateFolderTitle,
  UpdateOneFolder,
  LoadFullFolder,
  TransformTypeFolders,
  UpdateFullFolder,
  GetInvitedUsersToFolder,
  AddToDomFolders,
  ResetFolders,
  AddFolders,
  PatchUpdatesUIFolders,
  ResetFoldersState,
  UpdateFoldersCount,
  LoadFoldersCount,
} from './folders-actions';
import { Folders } from '../models/folders.model';
import { InvitedUsersToNoteOrFolder } from '../../notes/models/invited-users-to-note.model';
import { UpdateFolderUI } from './update-folder-ui.model';
import { Router } from '@angular/router';
import { PositionEntityModel } from '../../notes/models/position-note.model';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { LongTermOperationsHandlerService } from '../../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermsIcons } from '../../long-term-operations-handler/models/long-terms.icons';
import { SignalRService } from 'src/app/core/signal-r.service';
import { FoldersCount } from '../models/folders-count.model';

export interface FullFolderState {
  folder: FullFolder;
  isCanView: boolean;
}

export interface FolderState {
  folders: Folders[];
  fullFolderState: FullFolderState | null;
  isCanViewFullFolder: boolean;
  selectedIds: Set<string>;
  removeFromMurriEvent: string[];
  updateFolderEvent: UpdateFolderUI[];
  foldersAddToDOM: SmallFolder[];
  InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
  foldersCount: FoldersCount[];
}

@State<FolderState>({
  name: 'Folders',
  defaults: {
    folders: [],
    fullFolderState: null,
    isCanViewFullFolder: false,
    selectedIds: new Set(),
    removeFromMurriEvent: [],
    updateFolderEvent: [],
    foldersAddToDOM: [],
    InvitedUsersToNote: [],
    foldersCount: []
  },
})
@Injectable()
export class FolderStore {
  constructor(
    private api: ApiFoldersService,
    private router: Router,
    private ngZone: NgZone,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private signalR: SignalRService,
  ) { }

  static getFoldersByTypeStatic(state: FolderState, type: FolderTypeENUM) {
    return state.folders.find((x) => x.typeFolders === type);
  }

  @Selector()
  static getUsersOnPrivateFolder(state: FolderState): InvitedUsersToNoteOrFolder[] {
    return state.InvitedUsersToNote;
  }

  @Selector()
  static getSmallFolders(state: FolderState): SmallFolder[] {
    return state.folders.flatMap((x) => x.folders);
  }

  @Selector()
  static full(state: FolderState): FullFolder {
    return state.fullFolderState?.folder;
  }

  @Selector()
  static getFoldersCount(state: FolderState): FoldersCount[] {
    return state.foldersCount;
  }

  @Selector()
  static fullFolderShared(state: FolderState): boolean {
    return state.fullFolderState?.folder?.folderTypeId === FolderTypeENUM.Shared;
  }

  @Selector([UserStore.getUser])
  static isFullFolderOwner(folderState: FolderState, user: ShortUser) {
    const folderOwnerId = folderState.fullFolderState?.folder?.userId;
    return folderOwnerId === user.id;
  }

  @Selector()
  static isCanViewFullFolder(state: FolderState) {
    return state.isCanViewFullFolder;
  }

  @Selector()
  static isFullFolderViewer(state: FolderState): boolean {
    return state.fullFolderState?.folder?.refTypeId === RefTypeENUM.Viewer;
  }

  @Selector()
  static isFullFolderEditor(state: FolderState): boolean {
    return state.fullFolderState?.folder?.refTypeId === RefTypeENUM.Editor;
  }

  @Selector()
  static fullFolderTitle(state: FolderState): string {
    return state.fullFolderState?.folder?.title;
  }

  @Selector()
  static canEdit(state: FolderState): boolean {
    return state.fullFolderState?.folder?.isCanEdit;
  }

  @Selector()
  static canView(state: FolderState): boolean {
    return state.fullFolderState?.isCanView;
  }

  @Selector()
  static selectedCount(state: FolderState): number {
    return state.selectedIds?.size;
  }

  @Selector()
  static activeMenu(state: FolderState): boolean {
    return state.selectedIds?.size > 0;
  }

  // Get folders
  @Selector()
  static privateFolders(state: FolderState): SmallFolder[] {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Private).folders;
  }

  @Selector()
  static sharedFolders(state: FolderState): SmallFolder[] {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Shared).folders;
  }

  @Selector()
  static deletedFolders(state: FolderState): SmallFolder[] {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Deleted).folders;
  }

  @Selector()
  static archiveFolders(state: FolderState): SmallFolder[] {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Archive).folders;
  }

  @Selector()
  static privateCount(state: FolderState): number {
    const foldersCount = state.foldersCount.find(x => x.folderTypeId === FolderTypeENUM.Private);
    return foldersCount?.count ?? 0;
  }

  @Selector()
  static archiveCount(state: FolderState): number {
    const foldersCount = state.foldersCount.find(x => x.folderTypeId === FolderTypeENUM.Archive);
    return foldersCount?.count ?? 0;
  }

  @Selector()
  static deletedCount(state: FolderState): number {
    const foldersCount = state.foldersCount.find(x => x.folderTypeId === FolderTypeENUM.Deleted);
    return foldersCount?.count ?? 0;
  }

  @Selector()
  static sharedCount(state: FolderState): number {
    const foldersCount = state.foldersCount.find(x => x.folderTypeId === FolderTypeENUM.Shared);
    return foldersCount?.count ?? 0;
  }

  @Selector()
  static getFolders(state: FolderState): Folders[] {
    return state.folders;
  }

  @Selector()
  static getSelectedFolders(state: FolderState): SmallFolder[] {
    return state.folders
      .flatMap((x) => x.folders)
      .filter((folder) => state.selectedIds.has(folder.id));
  }

  @Selector()
  static getAllSelectedFoldersCanEdit(state: FolderState): boolean {
    return this.getSelectedFolders(state).every((x) => x.isCanEdit);
  }

  @Selector()
  static getAllSelectedFoldersAuthors(state: FolderState): string[] {
    return [...new Set(this.getSelectedFolders(state).map((x) => x.userId))];
  }

  // Get selected Ids

  @Selector()
  static selectedIds(state: FolderState): Set<string> {
    return state.selectedIds;
  }

  @Selector()
  static removeFromMurriEvent(state: FolderState): string[] {
    return state.removeFromMurriEvent;
  }

  @Selector()
  static updateFolderEvents(state: FolderState): UpdateFolderUI[] {
    return state.updateFolderEvent;
  }

  @Selector()
  static foldersAddToDOM(state: FolderState): SmallFolder[] {
    return state.foldersAddToDOM;
  }

  @Selector()
  static getOwnerId(state: FolderState): string {
    return state.fullFolderState?.folder?.userId;
  }

  @Action(ClearUpdatesUIFolders)
  // eslint-disable-next-line class-methods-use-this
  clearUpdates({ patchState }: StateContext<FolderState>) {
    patchState({ updateFolderEvent: [] });
  }

  @Action(PatchUpdatesUIFolders)
  // eslint-disable-next-line class-methods-use-this
  patchUpdatesUIFolders(
    { patchState }: StateContext<FolderState>,
    { updates }: PatchUpdatesUIFolders,
  ) {
    patchState({ updateFolderEvent: updates });
  }

  @Action(CopyFolders)
  async copyFolders(
    { getState, dispatch }: StateContext<FolderState>,
    { typeFolder, selectedIds }: CopyFolders,
  ) {
    const operation = this.longTermOperationsHandler.addNewCopingOperation('uploader.copyFolders');

    const resp = await this.api.copyFolders(selectedIds, operation).toPromise();
   
    const newFolders = resp.data?.folders;
    if (resp.success && newFolders?.length > 0) {
      const privateFolders = this.getFoldersByType(getState, FolderTypeENUM.Private);
      dispatch(
        new UpdateFolders(
          new Folders(FolderTypeENUM.Private, [...newFolders, ...privateFolders]),
          FolderTypeENUM.Private,
        ),
      );
      if (typeFolder === FolderTypeENUM.Private) {
        dispatch(new AddToDomFolders([...newFolders]));
      }
    }
    if (resp.success && resp.data?.noteIds?.length > 0) {
      // TODO MESSAGE
    }
    if (!resp.success && resp.status === OperationResultAdditionalInfo.BillingError) {
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, null, 'end', 5000);
    }
    if (!resp.success && resp.status === OperationResultAdditionalInfo.NotEnoughMemory) {
      const message = this.translate.instant('files.noEnoughMemory');
      this.snackbarService.openSnackBar(message, null, 'end', 5000);
    }

    dispatch([UnSelectAllFolder]);
  }

  @Action(ClearAddToDomFolders)
  // eslint-disable-next-line class-methods-use-this
  clearAddedPrivateFoldersEvent({ patchState }: StateContext<FolderState>) {
    patchState({
      foldersAddToDOM: [],
    });
  }

  @Action(AddToDomFolders)
  // eslint-disable-next-line class-methods-use-this
  addAddedPrivateNotes({ patchState }: StateContext<FolderState>, { folders }: AddToDomFolders) {
    patchState({
      foldersAddToDOM: folders,
    });
  }

  @Action(DeleteFoldersPermanently)
  async deleteFoldersPermanently(
    { getState, dispatch, patchState }: StateContext<FolderState>,
    { selectedIds, isCallApi }: DeleteFoldersPermanently,
  ) {
    if (isCallApi) {
      await this.api.deleteFolders(selectedIds).toPromise();
    }

    for (const { folders, typeFolders } of getState().folders) {
      const foldersFromNew = folders.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
      dispatch(new UpdateFolders(new Folders(typeFolders, foldersFromNew), typeFolders));
    }

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });

    dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
  }

  @Action(ChangeTypeFolder)
  async changeTypeFolder(
    { dispatch }: StateContext<FolderState>,
    {
      typeTo,
      selectedIds,
      isAddingToDom,
      errorPermissionMessage,
      successCallback,
      refTypeId,
    }: ChangeTypeFolder,
  ) {
    let resp: OperationResult<any>;
    switch (typeTo) {
      case FolderTypeENUM.Private: {
        resp = await this.api.makePrivate(selectedIds).toPromise();
        if (resp.success) {
          dispatch(new TransformTypeFolders(FolderTypeENUM.Private, selectedIds, isAddingToDom));
          if (successCallback) {
            successCallback();
          }
        }
        break;
      }
      case FolderTypeENUM.Deleted: {
        resp = await this.api.setDelete(selectedIds).toPromise();
        if (resp.success) {
          dispatch(
            new TransformTypeFolders(
              FolderTypeENUM.Deleted,
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
      case FolderTypeENUM.Archive: {
        resp = await this.api.archive(selectedIds).toPromise();
        if (resp.success) {
          dispatch(new TransformTypeFolders(FolderTypeENUM.Archive, selectedIds, isAddingToDom));
          if (successCallback) {
            successCallback();
          }
        }
        break;
      }
      case FolderTypeENUM.Shared: {
        resp = await this.api.makePublic(refTypeId, selectedIds).toPromise();
        dispatch(
          new TransformTypeFolders(FolderTypeENUM.Shared, selectedIds, isAddingToDom, refTypeId),
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

  @Action(UpdatePositionsFolders)
  async changePosition(
    { getState, dispatch }: StateContext<FolderState>,
    { positions }: UpdatePositionsFolders,
  ) {
    if (!positions || positions.length === 0) {
      return;
    }

    const resp = await this.api.updateOrder(positions).toPromise();
    if (resp.success) {
      positions.forEach((pos) => {
        const folder = this.getFolderById(getState, pos.entityId);
        if (folder) {
          folder.order = pos.position;
        }
        dispatch(new UpdateOneFolder(folder, folder.id));
      });
    }
  }

  @Action(UpdateFoldersCount)
  // eslint-disable-next-line class-methods-use-this
  updateFoldersCount({ setState, getState }: StateContext<FolderState>, { count, typeFolder }: UpdateFoldersCount) {
    const state = getState().foldersCount;
    const typeCount = state.find(x => x.folderTypeId == typeFolder);
    if (typeCount) {
      setState(
        patch({
          foldersCount: updateItem<FoldersCount>((folders) => folders.folderTypeId === typeFolder,
            {
              folderTypeId: typeFolder,
              count
            }),
        }),
      );
    } else {
      const foldersCount = { folderTypeId: typeFolder, count } as FoldersCount;
      setState(
        patch({
          foldersCount: append<FoldersCount>([foldersCount])
        })
      );
    }
  }

  @Action(LoadFoldersCount)
  async loadFoldersCount({ patchState }: StateContext<FolderState>) {
    const request = await this.api.getCount().toPromise();
    patchState({
      foldersCount: request
    })
  }

  @Action(TransformTypeFolders)
  async transformFromTo(
    { getState, dispatch, patchState }: StateContext<FolderState>,
    { typeTo, selectedIds, isAddToDom, refTypeId, deleteIds }: TransformTypeFolders,
  ) {
    const typeFrom = getState()
      .folders.map((x) => x.folders)
      .flat()
      .find((q) => selectedIds.some((x) => x === q.id)).folderTypeId;

    const foldersFrom = this.getFoldersByType(getState, typeFrom);

    const foldersFromNew = foldersFrom.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
    dispatch(new UpdateFolders(new Folders(typeFrom, foldersFromNew), typeFrom));

    let foldersAdded = foldersFrom.filter((x) =>
      this.itemsFromFilterArray(deleteIds ?? selectedIds, x),
    );

    let foldersTo = this.getFoldersByType(getState, typeTo).map((x) => ({ ...x }));
    foldersTo.forEach((x) => (x.order = x.order + foldersAdded.length));

    foldersAdded = foldersAdded.map((x, index) => {
      const folder = { ...x };
      folder.folderTypeId = typeTo;
      folder.refTypeId = refTypeId ?? folder.refTypeId;
      folder.order = index + 1;
      folder.updatedAt = new Date();
      return folder;
    });

    const newFoldersTo = [...foldersAdded, ...foldersTo];
    await dispatch(new UpdateFolders(new Folders(typeTo, newFoldersTo), typeTo)).toPromise();

    // UPDATE FULL NOTE
    const idToUpdate = selectedIds.find((id) => id === getState().fullFolderState?.folder?.id);
    if (idToUpdate) {
      dispatch(new UpdateFullFolder({ folderTypeId: typeTo, refTypeId }, idToUpdate));
    }

    // UPDATE POSITIONS
    foldersTo = this.getFoldersByType(getState, typeTo);
    const positions = foldersTo.map(
      (x) => ({ entityId: x.id, position: x.order } as PositionEntityModel),
    );
    dispatch(new UpdatePositionsFolders(positions));

    patchState({
      removeFromMurriEvent: [...selectedIds],
    });

    dispatch([UnSelectAllFolder, RemoveFromDomMurri]);

    if (isAddToDom) {
      dispatch(new AddToDomFolders(foldersAdded));
    }
  }

  // Murri

  @Action(RemoveFromDomMurri)
  // eslint-disable-next-line class-methods-use-this
  removeFromDomMurri({ patchState }: StateContext<FolderState>) {
    patchState({
      removeFromMurriEvent: [],
    });
  }

  // SELECTIONS

  @Action(SelectIdFolder)
  // eslint-disable-next-line class-methods-use-this
  select({ patchState }: StateContext<FolderState>, { id, selectedIds }: SelectIdFolder) {
    patchState({ selectedIds: new Set([id, ...selectedIds]) });
  }

  @Action(UnSelectIdFolder)
  // eslint-disable-next-line class-methods-use-this
  unSelect({ patchState }: StateContext<FolderState>, { id, selectedIds }: UnSelectIdFolder) {
    const ids = selectedIds.filter((x) => x !== id);
    patchState({ selectedIds: new Set([...ids]) });
  }

  @Action(UnSelectAllFolder)
  // eslint-disable-next-line class-methods-use-this
  unselectAll({ patchState }: StateContext<FolderState>) {
    patchState({ selectedIds: new Set() });
  }

  @Action(SelectAllFolder)
  selectAll({ patchState, getState }: StateContext<FolderState>, { typeFolder }: SelectAllFolder) {
    const folders = this.getFoldersByType(getState, typeFolder);
    const ids = folders.map((q) => q.id);

    patchState({ selectedIds: new Set([...ids]) });
  }

  // LOAD CONTENT
  @Action(LoadFolders)
  async loadPrivateFolders(
    { getState, patchState }: StateContext<FolderState>,
    { type, pr }: LoadFolders,
  ) {
    if (!getState().folders?.find((q) => q.typeFolders === type)) {
      const folders = await this.api.getFolders(type, pr).toPromise();
      patchState({
        folders: [...getState().folders, folders],
      });
    }
  }

  @Action(ResetFolders)
  // eslint-disable-next-line class-methods-use-this
  async resetFolders({ patchState }: StateContext<FolderState>) {
    patchState({ folders: [] });
  }

  @Action(ResetFoldersState)
  // eslint-disable-next-line class-methods-use-this
  async resetFoldersState({ patchState }: StateContext<FolderState>) {
    patchState({
      folders: [],
      fullFolderState: null,
      isCanViewFullFolder: false,
      selectedIds: new Set(),
      removeFromMurriEvent: [],
      updateFolderEvent: [],
      foldersAddToDOM: [],
      InvitedUsersToNote: [],
    });
  }

  @Action(UpdateFolders)
  // eslint-disable-next-line class-methods-use-this
  async updateFolders(
    { setState, dispatch }: StateContext<FolderState>,
    { folders, typeFolder }: UpdateFolders,
  ) {
    setState(
      patch({
        folders: updateItem<Folders>((folderss) => folderss.typeFolders === typeFolder, folders),
      }),
    );
    dispatch(new UpdateFoldersCount(folders.folders?.length ?? 0, typeFolder));
  }

  // FUNCTIONS
  @Action(CreateFolder)
  async newFolder({ getState, dispatch }: StateContext<FolderState>) {
    const resp = await this.api.new().toPromise();
    if (resp.success) {
      const newF = resp.data;
      const folders = this.getFoldersByType(getState, FolderTypeENUM.Private);
      const toUpdate = new Folders(FolderTypeENUM.Private, [newF, ...folders]);
      dispatch(new UpdateFolders(toUpdate, FolderTypeENUM.Private));
      this.ngZone.run(() => this.router.navigate([`folders/${newF.id}`]));
      return;
    }
    if (!resp.success && resp.status === OperationResultAdditionalInfo.BillingError) {
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, null, 'end', 5000);
    }
  }

  @Action(AddFolders)
  addFolder({ getState, dispatch }: StateContext<FolderState>, { folders, type }: AddFolders) {
    const foldersState = this.getFoldersByType(getState, type);
    const toUpdate = new Folders(type, [...folders, ...foldersState]);
    dispatch(new UpdateFolders(toUpdate, type));
  }

  @Action(ChangeColorFolder)
  async changeColor(
    { patchState, getState, dispatch }: StateContext<FolderState>,
    { color, selectedIds, isCallApi, errorPermissionMessage }: ChangeColorFolder,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.api.changeColor(selectedIds, color, this.signalR.connectionIdOrError).toPromise();
    }
    if (resp.success) {
      const fullFolder = getState().fullFolderState?.folder;
      if (fullFolder && selectedIds.some((id) => id === fullFolder.id)) {
        patchState({ fullFolderState: { ...getState().fullFolderState, folder: { ...fullFolder, color } } });
      }
      const foldersForUpdate = this.getFoldersByIds(getState, selectedIds);
      foldersForUpdate.forEach((folder) => (folder.color = color));
      const updatesUI = foldersForUpdate.map((folder) =>
        this.toUpdateFolderUI(folder.id, folder.color, null, false),
      );
      patchState({ updateFolderEvent: updatesUI });
      foldersForUpdate.forEach((folder) => dispatch(new UpdateOneFolder(folder, folder.id)));
      dispatch([UnSelectAllFolder]);
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(UpdateOneFolder)
  updateOneFolder(
    { dispatch, getState }: StateContext<FolderState>,
    { folder, folderId }: UpdateOneFolder,
  ) {
    for (const foldersState of getState().folders) {
      let isUpdate = false;
      let type: FolderTypeENUM = null;
      const folders = foldersState.folders.map((storeFolder) => {
        if (storeFolder.id === folderId) {
          isUpdate = true;
          type = storeFolder.folderTypeId;
          return { ...storeFolder, ...folder };
        }
        return storeFolder;
      });
      if (isUpdate && type) {
        const state = new Folders(type, [...folders]);
        dispatch(new UpdateFolders(state, type));
      }
    }
  }

  @Action(UpdateFolderTitle)
  async updateTitleFolder(
    { getState, dispatch, patchState }: StateContext<FolderState>,
    {
      str,
      folderId,
      isCallApi,
      errorPermissionMessage,
      isUpdateFullNote,
      isUpdateSmallFolders,
      isUpdateUI,
    }: UpdateFolderTitle,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.api.updateTitle(str, folderId, this.signalR.connectionIdOrError).toPromise();
    }
    if (resp.success) {
      // FULL NOTE
      if (isUpdateFullNote) {
        const folder = getState().fullFolderState?.folder;
        if (folder && folder.id === folderId) {
          patchState({ fullFolderState: { ...getState().fullFolderState, folder: { ...folder, title: str } } });
        }
      }

      // UPDATE SMALL NOTE
      if (isUpdateSmallFolders) {
        const folderUpdate = this.getFolderById(getState, folderId);
        if (folderUpdate) {
          dispatch(new UpdateOneFolder({ ...folderUpdate, title: str }, folderUpdate.id));
        }
      }

      // UI CHANGES
      if (isUpdateUI) {
        const uiChanges = this.toUpdateFolderUI(folderId, null, str, true);
        patchState({ updateFolderEvent: [uiChanges] });
      }
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(LoadFullFolder)
  async loadFull({ patchState }: StateContext<FolderState>, { id }: LoadFullFolder) {
    const request = await this.api.get(id).toPromise();
    if (request.success) {
      patchState({
        fullFolderState: {
          folder: request.data,
          isCanView: true
        },
        isCanViewFullFolder: request.success,
      });
    } else {
      patchState({
        fullFolderState: {
          folder: null,
          isCanView: false
        },
        isCanViewFullFolder: request.success,
      });
    }
  }

  @Action(UpdateFullFolder)
  // eslint-disable-next-line class-methods-use-this
  async changeTypeFullFolder(
    { getState, patchState }: StateContext<FolderState>,
    { folder, folderId }: UpdateFullFolder,
  ) {
    const folderState = getState().fullFolderState?.folder;
    if (folder && folderId === folderState?.id) {
      const newFolder: FullFolder = { ...folderState, ...folder };
      patchState({ fullFolderState: { ...getState().fullFolderState, folder: newFolder } });
    }
  }

  @Action(GetInvitedUsersToFolder)
  async getInvitedUsersToNote(
    { patchState }: StateContext<FolderState>,
    { folderId }: GetInvitedUsersToFolder,
  ) {
    const users = await this.api.getUsersOnPrivateFolder(folderId).toPromise();
    patchState({
      InvitedUsersToNote: users,
    });
  }

  toUpdateFolderUI = (id: string, color: string, title: string, isUpdateTitle: boolean) => {
    const obj = new UpdateFolderUI(id);
    obj.color = color;
    obj.title = title;
    obj.isUpdateTitle = isUpdateTitle;
    return obj;
  };

  getFolderById = (getState: () => FolderState, id: string): SmallFolder => {
    for (const folders of getState().folders) {
      for (const x of folders.folders) {
        const folder = { ...x };
        if (id === folder.id) {
          return folder;
        }
      }
    }
    return null;
  };

  getFoldersByIds = (getState: () => FolderState, ids: string[]): SmallFolder[] => {
    const result: SmallFolder[] = [];
    getState().folders.forEach((folders) => {
      for (const x of folders.folders) {
        const folder = { ...x };
        if (ids.some((q) => q === folder.id)) {
          result.push(folder);
        }
      }
    });
    return result;
  };

  getFoldersByType = (getState: () => FolderState, type: FolderTypeENUM) => {
    return getState().folders?.find((q) => q.typeFolders === type)?.folders ?? [];
  };

  itemNoFromFilterArray = (ids: string[], folder: SmallFolder) => {
    return ids.indexOf(folder.id) === -1;
  };

  itemsFromFilterArray = (ids: string[], folder: SmallFolder) => {
    return ids.indexOf(folder.id) !== -1;
  };
}
