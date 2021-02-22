import { SmallFolder } from '../models/folder';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiFoldersService } from '../api-folders.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { FullFolder } from '../models/FullFolder';
import { LoadFolders, AddFolder, SelectIdFolder,
    UnSelectIdFolder, UnSelectAllFolder, SelectAllFolder, ArchiveFolders, RemoveFromDomMurri,
    ChangeColorFolder, ClearColorFolders, SetDeleteFolders, DeleteFoldersPermanently, CopyFolders,
    ClearAddedPrivateFolders,
     MakePrivateFolders, PositionFolder, UpdateFolders,
     UpdateTitle, UpdateOneFolder, LoadFullFolder,
     TransformTypeFolders, ChangeTypeFullFolder, GetInvitedUsersToFolder } from './folders-actions';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { UpdateColor } from '../../notes/state/updateColor';
import { patch, updateItem } from '@ngxs/store/operators';
import { Folders } from '../models/Folders';
import { InvitedUsersToNoteOrFolder } from '../../notes/models/invitedUsersToNote';


interface FullFolderState {
    folder: FullFolder;
    canView: boolean;
    caEdit: boolean;
}

interface FolderState {
    folders: Folders[];
    fullFolderState: FullFolderState;
    selectedIds: string[];
    removeFromMurriEvent: string[];
    updateColorEvent: UpdateColor[];
    foldersAddingPrivate: SmallFolder[];
    InvitedUsersToNote: InvitedUsersToNoteOrFolder[];
}


@State<FolderState>({
    name: 'Folders',
    defaults: {
        folders: [],
        fullFolderState: null,
        selectedIds: [],
        removeFromMurriEvent: [],
        updateColorEvent: [],
        foldersAddingPrivate: [],
        InvitedUsersToNote: []
    }
})

@Injectable()
export class FolderStore {

    constructor(private api: ApiFoldersService,
                private orderService: OrderService) {
    }

    @Selector()
    static getUsersOnPrivateFolder(state: FolderState): InvitedUsersToNoteOrFolder[] {
        return state.InvitedUsersToNote;
    }

    @Selector()
    static full(state: FolderState) {
        return state.fullFolderState.folder;
    }

    @Selector()
    static selectedCount(state: FolderState): number {
        return state.selectedIds.length;
    }

    @Selector()
    static activeMenu(state: FolderState): boolean {
        return state.selectedIds.length > 0 ? true : false;
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

    // Get selected Ids

    @Selector()
    static selectedIds(state: FolderState): string[] {
        return state.selectedIds;
    }

    // Murri Get REMOVE
    @Selector()
    static removeFromMurriEvent(state: FolderState): string[] {
        return state.removeFromMurriEvent;
    }

    // COLOR
    @Selector()
    static updateColorEvent(state: FolderState): UpdateColor[] {
        return state.updateColorEvent;
    }

    @Selector()
    static foldersAddingPrivate(state: FolderState): SmallFolder[] {
        return state.foldersAddingPrivate;
    }

    static getFoldersByTypeStatic(state: FolderState, type: FolderTypeENUM) {
        return state.folders.find(x => x.typeFolders === type);
    }

    // LOAD CONTENT
    @Action(LoadFolders)
    async loadPrivateFolders({ getState, patchState }: StateContext<FolderState>, {id, type}: LoadFolders) {
        if (!getState().folders.find(z => z.typeFolders === type.name)) {
            const folders = await this.api.getFolders(id , type.name).toPromise();
            patchState({
                folders: [...getState().folders, folders]
            });
        }
    }


    @Action(UpdateFolders)
    async updateFolders({ setState }: StateContext<FolderState>, { folders, typeFolder }: UpdateFolders) {
        setState(
            patch({
                folders: updateItem<Folders>(folderss => folderss.typeFolders === typeFolder, folders)
            })
        );
    }

    // FUNCTIONS
    @Action(AddFolder)
    async newFolder({ getState, dispatch }: StateContext<FolderState>) {
        const newF = await this.api.new().toPromise();
        const folders = this.getFoldersByType(getState, FolderTypeENUM.Private);
        const toUpdate = new Folders(FolderTypeENUM.Private, [newF, ...folders]);
        dispatch(new UpdateFolders(toUpdate, FolderTypeENUM.Private));
    }


    @Action(ArchiveFolders)
    async archiveFolders({ getState, patchState, dispatch }: StateContext<FolderState>, { typeFolder, selectedIds }: ArchiveFolders) {
        await this.api.archiveFolder(selectedIds).toPromise();
        dispatch(new TransformTypeFolders(typeFolder.name, FolderTypeENUM.Archive, selectedIds));
    }


    @Action(ChangeColorFolder)
    async changeColor({ patchState, getState, dispatch }: StateContext<FolderState>,
                      { color, typeFolder, selectedIds }: ChangeColorFolder) {

        await this.api.changeColor(selectedIds, color).toPromise();

        const folders = this.getFoldersByType(getState, typeFolder.name);
        const newFolders = folders.map(folder => {
            folder = { ...folder };
            if (selectedIds.some(z => z === folder.id)) {
                folder.color = color;
            }
            return folder;
        });

        const foldersForUpdate = folders.filter(x => selectedIds.some(z => z === x.id)).map(folder => {
            folder = { ...folder, color };
            return folder;
        });

        const updateColor = foldersForUpdate.map(folder => this.mapFromFolderToUpdateColor(folder));
        patchState({ updateColorEvent: updateColor });
        dispatch([new UpdateFolders(new Folders(typeFolder.name, newFolders), typeFolder.name), UnSelectAllFolder, ClearColorFolders]);

    }

    mapFromFolderToUpdateColor(folder: SmallFolder) {
        const obj: UpdateColor = {
            id: folder.id,
            color: folder.color
        };
        return obj;
    }

    @Action(ClearColorFolders)
    clearColorNotes({ patchState }: StateContext<FolderState>) {
        patchState({ updateColorEvent: [] });
    }


    @Action(SetDeleteFolders)
    async setDeleteFolders({ patchState, getState, dispatch }: StateContext<FolderState>, { typeFolder, selectedIds }: SetDeleteFolders) {
        await this.api.setDeleteFolder(selectedIds).toPromise();
        dispatch(new TransformTypeFolders(typeFolder.name, FolderTypeENUM.Deleted, selectedIds));
    }


    @Action(CopyFolders)
    async copyFolders({ getState, dispatch, patchState }: StateContext<FolderState>, { typeFolder, selectedIds }: CopyFolders) {

        const newFolders = await this.api.copyFolders(selectedIds).toPromise();

        const privateFolders = this.getFoldersByType(getState, FolderTypeENUM.Private);
        dispatch(new UpdateFolders(new Folders(FolderTypeENUM.Private, [...newFolders, ...privateFolders]), FolderTypeENUM.Private));
        dispatch([UnSelectAllFolder]);

        if (typeFolder.name === FolderTypeENUM.Private) {
            patchState({
                foldersAddingPrivate: [...newFolders]
            });
            dispatch(ClearAddedPrivateFolders);
        }
    }

    @Action(ClearAddedPrivateFolders)
    clearAddedPrivateFoldersEvent({ patchState }: StateContext<FolderState>) {
        patchState({
            foldersAddingPrivate: [],
        });
    }

    @Action(DeleteFoldersPermanently)
    async deleteFoldersPermanently({ getState, dispatch, patchState }: StateContext<FolderState>,
                                   {selectedIds, typeNote}: DeleteFoldersPermanently) {
        await this.api.deleteFolders(selectedIds).toPromise();

        const foldersFrom = this.getFoldersByType(getState, FolderTypeENUM.Deleted);
        const foldersFromNew = foldersFrom.filter(x => this.itemNoFromFilterArray(selectedIds, x));
        dispatch(new UpdateFolders(new Folders(FolderTypeENUM.Deleted, foldersFromNew), FolderTypeENUM.Deleted));

        patchState({
            removeFromMurriEvent: [...selectedIds]
        });
        dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
    }


    @Action(MakePrivateFolders)
    async MakePrivateFolder({ getState, dispatch, patchState }: StateContext<FolderState>, {typeFolder, selectedIds}: MakePrivateFolders) {
        await this.api.makePrivateFolders(selectedIds).toPromise();
        dispatch(new TransformTypeFolders(typeFolder.name, FolderTypeENUM.Private, selectedIds));
    }



    @Action(PositionFolder)
    async changePosition({getState, dispatch}: StateContext<FolderState>, {order, typeFolder}: PositionFolder) {
        let folders = this.getFoldersByType(getState, typeFolder.name);
        const changedFolder = folders.find(x => x.id === order.entityId);
        const flag = folders.indexOf(changedFolder);
        if (flag + 1 !== order.position) {
            await this.orderService.changeOrder(order).toPromise();
            folders = folders.filter(x => x.id !== order.entityId);
            folders.splice(order.position - 1, 0 , changedFolder);
            dispatch(new UpdateFolders(new Folders(typeFolder.name, [...folders]), typeFolder.name));
        }
    }


    @Action(TransformTypeFolders)
    tranformFromTo({getState, dispatch, patchState}: StateContext<FolderState>, {typeFrom, typeTo, selectedIds}: TransformTypeFolders) {
        const foldersFrom = this.getFoldersByType(getState, typeFrom);
        const foldersFromNew = foldersFrom.filter(x => this.itemNoFromFilterArray(selectedIds, x));

        let foldersAdded = foldersFrom.filter(x => this.itemsFromFilterArray(selectedIds, x));
        dispatch(new UpdateFolders(new Folders(typeFrom, foldersFromNew), typeFrom));

        foldersAdded = [...foldersAdded.map(folder => {
            return {...folder};
        })];
        foldersAdded.forEach(folder => folder.folderType.name = typeTo);

        const foldersTo = this.getFoldersByType(getState, typeTo);
        const newFoldersTo = [...foldersAdded, ...foldersTo];
        dispatch(new UpdateFolders(new Folders(typeTo, newFoldersTo), typeTo));

        patchState({
            removeFromMurriEvent: [...selectedIds],
        });
        dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
    }

    // Murri

    @Action(RemoveFromDomMurri)
    removeFromDomMurri({ patchState }: StateContext<FolderState>) {
        patchState({
            removeFromMurriEvent: [],
        });
    }

    // SELECTIONS

    @Action(SelectIdFolder)
    select({ patchState, getState }: StateContext<FolderState>, { id, selectedIds}: SelectIdFolder) {
        patchState({ selectedIds: [id, ...selectedIds] });
    }

    @Action(UnSelectIdFolder)
    unSelect({ getState, patchState }: StateContext<FolderState>, { id, selectedIds }: UnSelectIdFolder) {
        const ids = selectedIds.filter(x => x !== id);
        patchState({ selectedIds: [...ids] });
    }

    @Action(UnSelectAllFolder)
    unselectAll({ patchState, getState }: StateContext<FolderState>) {
        patchState({ selectedIds: [] });
    }

    @Action(SelectAllFolder)
    selectAll({ patchState, getState }: StateContext<FolderState>, { typeFolder }: SelectAllFolder) {

        const folders = this.getFoldersByType(getState, typeFolder.name);
        const ids = folders.map(z => z.id);

        patchState({ selectedIds: [...ids] });
    }

    getFoldersByType(getState: () => FolderState, type: FolderTypeENUM): SmallFolder[] {
        return getState().folders.find(z => z.typeFolders === type).folders;
    }

    itemNoFromFilterArray(ids: string[], folder: SmallFolder) {
        return ids.indexOf(folder.id) !== -1 ? false : true;
    }

    itemsFromFilterArray(ids: string[], folder: SmallFolder) {
        return ids.indexOf(folder.id) !== -1 ? true : false;
    }

    @Action(UpdateOneFolder)
    updateOneFolder({ dispatch, getState }: StateContext<FolderState>, { folder, typeFolder }: UpdateOneFolder) {
        let folders = this.getFoldersByType(getState, typeFolder);
        folders = folders.map(nt => {
            if (nt.id === folder.id) {
                nt = { ...folder };
            }
            return nt;
        });
        dispatch(new UpdateFolders(new Folders(typeFolder, [...folders]), typeFolder));
    }

    @Action(UpdateTitle)
    async updateTitleFolder({ getState, dispatch }: StateContext<FolderState>, { str, id, typeFolder }: UpdateTitle) {
        let folder = this.getFoldersByType(getState, typeFolder.name).find(z => z.id === id);
        folder = {...folder, title: str};
        dispatch(new UpdateOneFolder(folder, typeFolder.name));
        await this.api.updateTitle(str, id).toPromise();
    }

    @Action(LoadFullFolder)
    async loadFull({ setState, getState, patchState }: StateContext<FolderState>, { id }: LoadFullFolder) {
        const request = await this.api.get(id).toPromise();
        patchState({
            fullFolderState: {
                canView: request.canView,
                caEdit: request.canEdit,
                folder: request.fullFolder
            }
        });
    }

    @Action(ChangeTypeFullFolder)
    async changeTypeFullFolder({ getState, patchState, dispatch }: StateContext<FolderState>, { type }: ChangeTypeFullFolder) {
        const folder = getState().fullFolderState?.folder;
        if (folder) {
            const newFolder: FullFolder = { ...folder, folderType: type };
            patchState({ fullFolderState: { ...getState().fullFolderState, folder: newFolder } });
        }
    }

    @Action(GetInvitedUsersToFolder)
    async getInvitedUsersToNote({ getState, patchState, dispatch }: StateContext<FolderState>, { folderId }: GetInvitedUsersToFolder) {
        const users = await this.api.getUsersOnPrivateFolder(folderId).toPromise();
        patchState({
            InvitedUsersToNote: users
        });
    }
}
