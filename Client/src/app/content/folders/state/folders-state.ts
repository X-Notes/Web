import { Folder } from '../models/folder';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiFoldersService } from '../api-folders.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { FullFolder } from '../models/FullFolder';
import { LoadPrivateFolders, LoadSharedFolders, LoadArchiveFolders,
    LoadDeletedFolders, LoadAllExceptFolders, AddFolder, SelectIdFolder,
    UnSelectIdFolder, UnSelectAllFolder, SelectAllFolder, ArchiveFolders, RemoveFromDomMurri,
    ChangeColorFolder, ClearColorFolders, SetDeleteFolders, DeleteFoldersPermanently, CopyFolders,
    ClearAddedPrivateFolders, MakePublicFolders,
     MakePrivateFolders, PositionFolder, UpdateFolders, UpdateTitle, UpdateOneFolder } from './folders-actions';
import { FolderColorPallete } from 'src/app/shared/enums/FolderColors';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { UpdateColor } from '../../notes/state/updateColor';
import { patch, updateItem } from '@ngxs/store/operators';
import { Folders } from '../models/Folders';
import { Observable } from 'rxjs';


interface FolderState {
    folders: Folders[];
    selectedIds: string[];
    removeFromMurriEvent: string[];
    updateColorEvent: UpdateColor[];
    foldersAddingPrivate: Folder[];
}


@State<FolderState>({
    name: 'Folders',
    defaults: {
        folders: [],
        selectedIds: [],
        removeFromMurriEvent: [],
        updateColorEvent: [],
        foldersAddingPrivate: []
    }
})

@Injectable()
export class FolderStore {

    constructor(private api: ApiFoldersService,
                private orderService: OrderService) {
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
    static privateFolders(state: FolderState): Folder[] {
        return state.folders.find(x => x.typeFolders === FolderType.Private).folders;
    }

    @Selector()
    static sharedFolders(state: FolderState): Folder[] {
        return state.folders.find(x => x.typeFolders === FolderType.Shared).folders;
    }

    @Selector()
    static deletedFolders(state: FolderState): Folder[] {
        return state.folders.find(x => x.typeFolders === FolderType.Deleted).folders;
    }

    @Selector()
    static archiveFolders(state: FolderState): Folder[] {
        return state.folders.find(x => x.typeFolders === FolderType.Archive).folders;
    }


    // Get count folders
    @Selector()
    static privateCount(state: FolderState): number {
        return state.folders.find(x => x.typeFolders === FolderType.Private).count;
    }

    @Selector()
    static archiveCount(state: FolderState): number {
        return state.folders.find(x => x.typeFolders === FolderType.Archive).count;
    }

    @Selector()
    static deletedCount(state: FolderState): number {
        return state.folders.find(x => x.typeFolders === FolderType.Deleted).count;
    }

    @Selector()
    static sharedCount(state: FolderState): number {
        return state.folders.find(x => x.typeFolders === FolderType.Shared).count;
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
    static foldersAddingPrivate(state: FolderState): Folder[] {
        return state.foldersAddingPrivate;
    }

    // LOAD CONTENT
    @Action(LoadPrivateFolders)
    async loadPrivateFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().folders.find(z => z.typeFolders === FolderType.Private)) {
            const folders = await this.api.getPrivateFolders().toPromise();
            patchState({
                folders: [...getState().folders, folders]
            });
        }
    }

    @Action(LoadSharedFolders)
    async loadSharedFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().folders.find(z => z.typeFolders === FolderType.Shared)) {
            const folders = await this.api.getSharedFolders().toPromise();
            patchState({
                folders: [...getState().folders, folders]
            });
        }
    }

    @Action(LoadArchiveFolders)
    async loadArchiveFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().folders.find(z => z.typeFolders === FolderType.Archive)) {
            const folders = await this.api.getArchiveFolders().toPromise();
            patchState({
                folders: [...getState().folders, folders]
            });
        }
    }

    @Action(LoadDeletedFolders)
    async loadDeletedFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().folders.find(z => z.typeFolders === FolderType.Deleted)) {
            const folders = await this.api.getDeletedFolders().toPromise();
            patchState({
                folders: [...getState().folders, folders]
            });
        }
    }

    @Action(LoadAllExceptFolders)
    async loadAllFolders({ dispatch }: StateContext<FolderState>, {typeFolder}: LoadAllExceptFolders) {

        switch (typeFolder) {
            case FolderType.Archive: {
                dispatch([LoadPrivateFolders, LoadSharedFolders, LoadDeletedFolders]);
                break;
            }
            case FolderType.Private: {
                dispatch([LoadSharedFolders, LoadArchiveFolders, LoadDeletedFolders]);
                break;
            }
            case FolderType.Shared: {
                dispatch([LoadPrivateFolders, LoadArchiveFolders, LoadDeletedFolders]);
                break;
            }
            case FolderType.Deleted: {
                dispatch([LoadPrivateFolders, LoadSharedFolders, LoadArchiveFolders]);
                break;
            }
            case FolderType.Inner: {
                dispatch([LoadPrivateFolders, LoadSharedFolders, LoadArchiveFolders, LoadDeletedFolders]);
                break;
            }
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
        const id = await this.api.new().toPromise();
        const newFolder: Folder = { id, title: '', color: FolderColorPallete.Green };
        const folders = getState().folders.find(z => z.typeFolders === FolderType.Private).folders;
        const toUpdate = new Folders(FolderType.Private, [newFolder, ...folders]);
        dispatch(new UpdateFolders(toUpdate, FolderType.Private));
    }


    @Action(ArchiveFolders)
    async archiveFolders({ getState, patchState, dispatch }: StateContext<FolderState>, { typeFolder }: ArchiveFolders) {
        const selectedIds = getState().selectedIds;
        await this.api.archiveFolder(selectedIds).toPromise();
        this.tranformFromTo(getState, patchState, dispatch, typeFolder, FolderType.Archive, selectedIds);
    }


    @Action(ChangeColorFolder)
    async changeColor({ patchState, getState, dispatch }: StateContext<FolderState>, { color, typeFolder }: ChangeColorFolder) {

        const selectedIds = getState().selectedIds;
        await this.api.changeColor(selectedIds, color).toPromise();

        const folders = getState().folders.find(z => z.typeFolders === typeFolder).folders;
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
        dispatch([new UpdateFolders(new Folders(typeFolder, newFolders), typeFolder), UnSelectAllFolder, ClearColorFolders]);

    }

    mapFromFolderToUpdateColor(folder: Folder) {
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
    async setDeleteFolders({ patchState, getState, dispatch }: StateContext<FolderState>, { typeFolder }: SetDeleteFolders) {
        const selectedIds = getState().selectedIds;
        await this.api.setDeleteFolder(selectedIds).toPromise();
        this.tranformFromTo(getState, patchState, dispatch, typeFolder, FolderType.Deleted, selectedIds);
    }


    @Action(CopyFolders)
    async copyFolders({ getState, dispatch, patchState }: StateContext<FolderState>, { typeFolder }: CopyFolders) {

        const selectedIds = getState().selectedIds;
        const newFolders = await this.api.copyFolders(selectedIds).toPromise();

        const privateNotes = getState().folders.find(z => z.typeFolders === FolderType.Private).folders;
        dispatch(new UpdateFolders(new Folders(FolderType.Private, [...newFolders, ...privateNotes]), FolderType.Private));
        dispatch([UnSelectAllFolder]);

        if (typeFolder === FolderType.Private) {
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
    async deleteFoldersPermanently({ getState, dispatch, patchState }: StateContext<FolderState>) {
        const selectedIds = getState().selectedIds;
        await this.api.deleteFolders(selectedIds).toPromise();

        const foldersFrom = getState().folders.find(x => x.typeFolders === FolderType.Deleted);
        const foldersFromNew = foldersFrom.folders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
        dispatch(new UpdateFolders(new Folders(FolderType.Deleted, foldersFromNew), FolderType.Deleted));

        patchState({
            removeFromMurriEvent: [...selectedIds]
        });
        dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
    }

    @Action(MakePublicFolders)
    async MakePublicFolder({ getState, dispatch, patchState }: StateContext<FolderState>, {typeFolder}: MakePublicFolders) {

    }

    @Action(MakePrivateFolders)
    async MakePrivateFolder({ getState, dispatch, patchState }: StateContext<FolderState>, {typeFolder}: MakePrivateFolders) {

        const selectedIds = getState().selectedIds;
        await this.api.makePrivateFolders(selectedIds).toPromise();
        this.tranformFromTo(getState, patchState, dispatch, typeFolder, FolderType.Private, selectedIds);

    }



    @Action(PositionFolder)
    async changePosition({getState, dispatch}: StateContext<FolderState>, {order, typeFolder}: PositionFolder) {
        let folders = getState().folders.find(z => z.typeFolders === typeFolder).folders;
        const changedFolder = folders.find(x => x.id === order.entityId);
        const flag = folders.indexOf(changedFolder);
        if (flag + 1 !== order.position) {
            await this.orderService.changeOrder(order).toPromise();
            folders = folders.filter(x => x.id !== order.entityId);
            folders.splice(order.position - 1, 0 , changedFolder);
            dispatch(new UpdateFolders(new Folders(typeFolder, [...folders]), typeFolder));
        }
    }


    tranformFromTo(
        getState: () => FolderState,
        patchState: (val: Partial<FolderState>) => FolderState,
        dispatch: (actions: any) => Observable<void>,
        typeFrom: FolderType,
        typeTo: FolderType,
        selectedIds: string[]) {

        const foldersFrom = getState().folders.find(x => x.typeFolders === typeFrom);
        const foldersFromNew = foldersFrom.folders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);

        const foldersAdded = foldersFrom.folders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
        dispatch(new UpdateFolders(new Folders(typeFrom, foldersFromNew), typeFrom));

        const foldersTo = getState().folders.find(z => z.typeFolders === typeTo).folders;
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
    select({ patchState, getState }: StateContext<FolderState>, { id }: SelectIdFolder) {
        const ids = getState().selectedIds;
        patchState({ selectedIds: [id, ...ids] });
    }

    @Action(UnSelectIdFolder)
    unSelect({ getState, patchState }: StateContext<FolderState>, { id }: UnSelectIdFolder) {
        let ids = getState().selectedIds;
        ids = ids.filter(x => x !== id);
        patchState({ selectedIds: [...ids] });
    }

    @Action(UnSelectAllFolder)
    unselectAll({ patchState, getState }: StateContext<FolderState>) {
        patchState({ selectedIds: [] });
    }

    @Action(SelectAllFolder)
    selectAll({ patchState, getState }: StateContext<FolderState>, { typeFolder }: SelectAllFolder) {

        const ids = getState().folders
        .find(z => z.typeFolders === typeFolder).folders
        .map(z => z.id);

        patchState({ selectedIds: [...ids] });
    }

    getFoldersByType(getState: () => FolderState, type: FolderType): Folder[] {
        return getState().folders.find(z => z.typeFolders === type).folders;
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
    async updateTitleFolder({ patchState, getState, dispatch }: StateContext<FolderState>, { str, id, typeFolder }: UpdateTitle) {
        let folder = this.getFoldersByType(getState, typeFolder).find(z => z.id === id);
        folder = {...folder, title: str};
        dispatch(new UpdateOneFolder(folder, typeFolder));
        await this.api.updateTitle(str, id).toPromise();
    }
}
