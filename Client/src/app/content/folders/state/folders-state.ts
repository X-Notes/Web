/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { patch, updateItem } from '@ngxs/store/operators';
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
  ChangeTypeFullFolder,
  GetInvitedUsersToFolder,
  AddToDomFolders,
  ResetFolders,
  AddFolders,
} from './folders-actions';
import { Folders } from '../models/folders.model';
import { InvitedUsersToNoteOrFolder } from '../../notes/models/invited-users-to-note.model';
import { UpdateFolderUI } from './update-folder-ui.model';
import { Router } from '@angular/router';
import { PositionEntityModel } from '../../notes/models/position-note.model';

interface FullFolderState {
  isOwner: boolean;
  folder: FullFolder;
  canView: boolean;
  caEdit: boolean;
}

interface FolderState {
  folders: Folders[];
  fullFolderState: FullFolderState;
  selectedIds: string[];
  removeFromMurriEvent: string[];
  updateFolderEvent: UpdateFolderUI[];
  foldersAddToDOM: SmallFolder[];
  InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
}

@State<FolderState>({
  name: 'Folders',
  defaults: {
    folders: [],
    fullFolderState: null,
    selectedIds: [],
    removeFromMurriEvent: [],
    updateFolderEvent: [],
    foldersAddToDOM: [],
    InvitedUsersToNote: [],
  },
})
@Injectable()
export class FolderStore {
  constructor(
    private api: ApiFoldersService,
    private router: Router) {}

  static getFoldersByTypeStatic(state: FolderState, type: FolderTypeENUM) {
    return state.folders.find((x) => x.typeFolders === type);
  }

  @Selector()
  static getUsersOnPrivateFolder(state: FolderState): InvitedUsersToNoteOrFolder[] {
    return state.InvitedUsersToNote;
  }

  @Selector()
  static getSmallFolders(state: FolderState): SmallFolder[] {
    return state.folders.flatMap(x => x.folders);
  }

  @Selector()
  static full(state: FolderState) {
    return state.fullFolderState.folder;
  }

  @Selector()
  static canView(state: FolderState): boolean {
    return state.fullFolderState?.canView;
  }

  @Selector()
  static canNoView(state: FolderState): boolean {
    return !state.fullFolderState?.canView;
  }

  @Selector()
  static isOwner(state: FolderState): boolean {
    return state.fullFolderState?.isOwner;
  }

  @Selector()
  static selectedCount(state: FolderState): number {
    return state.selectedIds.length;
  }

  @Selector()
  static activeMenu(state: FolderState): boolean {
    return state.selectedIds?.length > 0;
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
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Private).count;
  }

  @Selector()
  static archiveCount(state: FolderState): number {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Archive).count;
  }

  @Selector()
  static deletedCount(state: FolderState): number {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Deleted).count;
  }

  @Selector()
  static sharedCount(state: FolderState): number {
    return this.getFoldersByTypeStatic(state, FolderTypeENUM.Shared).count;
  }

  @Selector()
  static getFolders(state: FolderState): Folders[] {
    return state.folders;
  }

  @Selector()
  static getSelectedFolders(state: FolderState): SmallFolder[] {
    return state.folders.flatMap(x => x.folders).filter((folder) => state.selectedIds.some(z => z === folder.id));
  }

  @Selector()
  static getAllSelectedFoldersCanEdit(state: FolderState): boolean {
    return this.getSelectedFolders(state).every(x => x.isCanEdit);
  }

  @Selector()
  static getAllSelectedFoldersAuthors(state: FolderState): string[] {
    return [...new Set(this.getSelectedFolders(state).map(x => x.userId))];
  }

  // Get selected Ids

  @Selector()
  static selectedIds(state: FolderState): string[] {
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

  @Action(ClearUpdatesUIFolders)
  // eslint-disable-next-line class-methods-use-this
  clearUpdates({ patchState }: StateContext<FolderState>) {
    patchState({ updateFolderEvent: [] });
  }

  @Action(CopyFolders)
  async copyFolders(
    { getState, dispatch }: StateContext<FolderState>,
    { typeFolder, selectedIds }: CopyFolders,
  ) {
    const newFolders = await this.api.copyFolders(selectedIds).toPromise();

    const privateFolders = this.getFoldersByType(getState, FolderTypeENUM.Private);
    dispatch(
      new UpdateFolders(
        new Folders(FolderTypeENUM.Private, [...newFolders, ...privateFolders]),
        FolderTypeENUM.Private,
      ),
    );
    dispatch([UnSelectAllFolder]);

    if (typeFolder === FolderTypeENUM.Private) {
      dispatch(new AddToDomFolders([...newFolders]));
    }
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

    if(isCallApi){
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
          dispatch(new TransformTypeFolders(FolderTypeENUM.Deleted, selectedIds, isAddingToDom));
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
        await this.api.makePublic(refTypeId, selectedIds).toPromise();
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

    if(!positions || positions.length === 0){
      return;
    }

    const resp = await this.api.updateOrder(positions).toPromise();
    if(resp.success){
      positions.forEach(pos => {
        const folder = this.getFolderById(getState, pos.entityId);
        if(folder){
          folder.order = pos.position;
        }
        dispatch(new UpdateOneFolder(folder));
      });
    }
  }

  @Action(TransformTypeFolders)
  async transformFromTo(
    { getState, dispatch, patchState }: StateContext<FolderState>,
    { typeTo, selectedIds, isAddToDom, refTypeId }: TransformTypeFolders,
  ) {
    const typeFrom = getState()
      .folders.map((x) => x.folders)
      .flat()
      .find((z) => selectedIds.some((x) => x === z.id)).folderTypeId;


    const foldersFrom = this.getFoldersByType(getState, typeFrom);

    const foldersFromNew = foldersFrom.filter((x) => this.itemNoFromFilterArray(selectedIds, x));
    dispatch(new UpdateFolders(new Folders(typeFrom, foldersFromNew), typeFrom));

    let foldersAdded = foldersFrom.filter((x) => this.itemsFromFilterArray(selectedIds, x));

    let foldersTo = this.getFoldersByType(getState, typeTo).map(x => ({...x}));
    foldersTo.forEach((x) => x.order = x.order + foldersAdded.length);

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
    patchState({ selectedIds: [id, ...selectedIds] });
  }

  @Action(UnSelectIdFolder)
  // eslint-disable-next-line class-methods-use-this
  unSelect({ patchState }: StateContext<FolderState>, { id, selectedIds }: UnSelectIdFolder) {
    const ids = selectedIds.filter((x) => x !== id);
    patchState({ selectedIds: [...ids] });
  }

  @Action(UnSelectAllFolder)
  // eslint-disable-next-line class-methods-use-this
  unselectAll({ patchState }: StateContext<FolderState>) {
    patchState({ selectedIds: [] });
  }

  @Action(SelectAllFolder)
  selectAll({ patchState, getState }: StateContext<FolderState>, { typeFolder }: SelectAllFolder) {
    const folders = this.getFoldersByType(getState, typeFolder);
    const ids = folders.map((z) => z.id);

    patchState({ selectedIds: [...ids] });
  }

  // LOAD CONTENT
  @Action(LoadFolders)
  async loadPrivateFolders(
    { getState, patchState }: StateContext<FolderState>,
    { type, pr }: LoadFolders,
  ) {
    if (!getState().folders.find((z) => z.typeFolders === type)) {
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

  @Action(UpdateFolders)
  // eslint-disable-next-line class-methods-use-this
  async updateFolders(
    { setState }: StateContext<FolderState>,
    { folders, typeFolder }: UpdateFolders,
  ) {
    setState(
      patch({
        folders: updateItem<Folders>((folderss) => folderss.typeFolders === typeFolder, folders),
      }),
    );
  }

  // FUNCTIONS
  @Action(CreateFolder)
  async newFolder({ getState, dispatch }: StateContext<FolderState>) {
    const newF = await this.api.new().toPromise();
    const folders = this.getFoldersByType(getState, FolderTypeENUM.Private);
    const toUpdate = new Folders(FolderTypeENUM.Private, [newF, ...folders]);
    dispatch(new UpdateFolders(toUpdate, FolderTypeENUM.Private));
    this.router.navigate([`folders/${newF.id}`])
  }

  @Action(AddFolders)
  addFolder({ getState, dispatch }: StateContext<FolderState>, { folders, type } : AddFolders) {
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
      resp = await this.api.changeColor(selectedIds, color).toPromise();
    }
    if (resp.success) {
      const fullFolder = getState().fullFolderState?.folder;
      if (fullFolder && selectedIds.some(id => id === fullFolder.id)) {
        patchState({ fullFolderState: { ...getState().fullFolderState, folder: {...fullFolder, color }}});
      }
      const foldersForUpdate = this.getFoldersByIds(getState, selectedIds);
      foldersForUpdate.forEach((folder) => folder.color = color);
      const updatesUI = foldersForUpdate.map((folder) =>
        this.toUpdateFolderUI(folder.id, folder.color, null),
      );
      patchState({ updateFolderEvent: updatesUI });
      foldersForUpdate.forEach((folder) => dispatch(new UpdateOneFolder(folder)));
      dispatch([UnSelectAllFolder]);
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(UpdateOneFolder)
  updateOneFolder({ dispatch, getState }: StateContext<FolderState>, { folder }: UpdateOneFolder) {
    let folders = this.getFoldersByType(getState, folder.folderTypeId);
    folders = folders.map((x) => {
      let nt = { ...x };
      if (nt.id === folder.id) {
        nt = { ...folder };
      }
      return nt;
    });
    dispatch(
      new UpdateFolders(new Folders(folder.folderTypeId, [...folders]), folder.folderTypeId),
    );
  }

  @Action(UpdateFolderTitle)
  async updateTitleFolder(
    { getState, dispatch, patchState }: StateContext<FolderState>,
    { str, folderId, isCallApi, errorPermissionMessage }: UpdateFolderTitle,
  ) {
    let resp: OperationResult<any> = { success: true, data: null, message: null };
    if (isCallApi) {
      resp = await this.api.updateTitle(str, folderId).toPromise();
    }
    if (resp.success) {
      const folder = getState().fullFolderState?.folder;
      if (folder && folder.id === folderId) {
        patchState({ fullFolderState: { ...getState().fullFolderState, folder: {...folder, title: str} } });
      }
      const folderUpdate = this.getFolderById(getState, folderId);
      folderUpdate.title = str;
      patchState({ updateFolderEvent: [this.toUpdateFolderUI(folderUpdate.id, null, folderUpdate.title)] });
      dispatch(new UpdateOneFolder(folderUpdate));
    }
    if (resp.status === OperationResultAdditionalInfo.NoAccessRights && errorPermissionMessage) {
      dispatch(new ShowSnackNotification(errorPermissionMessage));
    }
  }

  @Action(LoadFullFolder)
  async loadFull({ patchState }: StateContext<FolderState>, { id }: LoadFullFolder) {
    const request = await this.api.get(id).toPromise();
    patchState({
      fullFolderState: {
        isOwner: request.isOwner,
        canView: request.canView,
        caEdit: request.canEdit,
        folder: request.fullFolder,
      },
    });
  }

  @Action(ChangeTypeFullFolder)
  // eslint-disable-next-line class-methods-use-this
  async changeTypeFullFolder(
    { getState, patchState }: StateContext<FolderState>,
    { type }: ChangeTypeFullFolder,
  ) {
    const folder = getState().fullFolderState?.folder;
    if (folder) {
      const newFolder: FullFolder = { ...folder, folderTypeId: type };
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

  toUpdateFolderUI = (id: string, color: string, title: string) => {
    const obj = new UpdateFolderUI();
    obj.id = id;
    obj.color = color;
    obj.title = title;
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
        if (ids.some((z) => z === folder.id)) {
          result.push(folder);
        }
      }
    });
    return result;
  };

  getFoldersByType = (getState: () => FolderState, type: FolderTypeENUM) => {
    return getState().folders.find((z) => z.typeFolders === type).folders;
  };

  itemNoFromFilterArray = (ids: string[], folder: SmallFolder) => {
    return ids.indexOf(folder.id) === -1;
  };

  itemsFromFilterArray = (ids: string[], folder: SmallFolder) => {
    return ids.indexOf(folder.id) !== -1;
  };
}
