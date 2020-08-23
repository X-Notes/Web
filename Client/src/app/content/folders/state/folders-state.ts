import { Folder } from '../models/folder';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiFoldersService } from '../api-folders.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { FullFolder } from '../models/FullFolder';
import { LoadPrivateFolders, LoadSharedFolders, LoadArchiveFolders,
    LoadDeletedFolders, LoadAllFolders, AddFolder, SelectIdFolder,
    UnSelectIdFolder, UnSelectAllFolder, SelectAllFolder, ArchiveFolders, RemoveFromDomMurri,
    ChangeColorFolder, ClearColorFolders, UpdateSmallFolder, SetDeleteFolders,
    RestoreFolders, DeleteFoldersPermanently, CopyFolders,
    ClearAddedPrivateFolders, MakePublicFolders, MakePrivateFolders, PositionFolder } from './folders-actions';
import { tap } from 'rxjs/operators';
import { FolderColorPallete } from 'src/app/shared/enums/FolderColors';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { UpdateColor } from '../../notes/state/updateColor';
import { patch, updateItem } from '@ngxs/store/operators';


interface FolderState {
    privateFolders: Folder[];
    sharedFolders: Folder[];
    deletedFolders: Folder[];
    archiveFolders: Folder[];
    countPrivate: number;
    countShared: number;
    countDeleted: number;
    countArchive: number;
    privateLoaded: boolean;
    sharedLoaded: boolean;
    archiveLoaded: boolean;
    deletedLoaded: boolean;
    selectedIds: string[];
    removeFromMurriEvent: string[];
    updateColorEvent: UpdateColor[];
    foldersAddingPrivate: Folder[];
}


@State<FolderState>({
    name: 'Folders',
    defaults: {
        privateFolders: [],
        sharedFolders: [],
        deletedFolders: [],
        archiveFolders: [],
        countPrivate: 0,
        countShared: 0,
        countArchive: 0,
        countDeleted: 0,
        privateLoaded: false,
        sharedLoaded: false,
        archiveLoaded: false,
        deletedLoaded: false,
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
    static activeMenu(state: FolderState): boolean {
        return state.selectedIds.length > 0 ? true : false;
    }

    // Get folders
    @Selector()
    static privateFolders(state: FolderState): Folder[] {
        return state.privateFolders;
    }

    @Selector()
    static sharedFolders(state: FolderState): Folder[] {
        return state.sharedFolders;
    }

    @Selector()
    static deletedFolders(state: FolderState): Folder[] {
        return state.deletedFolders;
    }

    @Selector()
    static archiveFolders(state: FolderState): Folder[] {
        return state.archiveFolders;
    }


    // Get count folders
    @Selector()
    static privateCount(state: FolderState): number {
        return state.countPrivate;
    }

    @Selector()
    static archiveCount(state: FolderState): number {
        return state.countArchive;
    }

    @Selector()
    static deletedCount(state: FolderState): number {
        return state.countDeleted;
    }

    @Selector()
    static sharedCount(state: FolderState): number {
        return state.countShared;
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
    loadPrivateFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().privateLoaded) {
            return this.api.getPrivateFolders().pipe(tap(content => {
                patchState({
                    privateFolders: content,
                    privateLoaded: true,
                    countPrivate: content.length
                });
            }));
        }
    }

    @Action(LoadSharedFolders)
    loadSharedFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().sharedLoaded) {
            return this.api.getSharedFolders().pipe(tap(content => {
                patchState({
                    sharedFolders: content,
                    sharedLoaded: true,
                    countShared: content.length
                });
            }));
        }
    }

    @Action(LoadArchiveFolders)
    loadArchiveFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().archiveLoaded) {
            return this.api.getArchiveFolders().pipe(tap(content => {
                patchState({
                    archiveFolders: content,
                    archiveLoaded: true,
                    countArchive: content.length
                });
            }));
        }
    }

    @Action(LoadDeletedFolders)
    loadDeletedFolders({ getState, patchState }: StateContext<FolderState>) {
        if (!getState().deletedLoaded) {
            return this.api.getDeletedFolders().pipe(tap(content => {
                patchState({
                    deletedFolders: content,
                    deletedLoaded: true,
                    countDeleted: content.length
                });
            }));
        }
    }

    @Action(LoadAllFolders)
    async loadAllFolders({ dispatch }: StateContext<FolderState>) {
        dispatch([LoadPrivateFolders, LoadSharedFolders, LoadArchiveFolders, LoadDeletedFolders]);
    }


    @Action(UpdateSmallFolder)
    async updateSmallNote({ setState }: StateContext<FolderState>, { folder, typeFolder }: UpdateSmallFolder) {
        switch (typeFolder) {
            case FolderType.Archive: {
                setState(
                    patch({
                        archiveFolders: updateItem<Folder>(note2 => note2.id === folder.id, folder)
                    })
                );
                break;
            }
            case FolderType.Private: {
                setState(
                    patch({
                        privateFolders: updateItem<Folder>(folder2 => folder2.id === folder.id, folder)
                    })
                );
                break;
            }
            case FolderType.Shared: {
                setState(
                    patch({
                        sharedFolders: updateItem<Folder>(folder2 => folder2.id === folder.id, folder)
                    })
                );
                break;
            }
            case FolderType.Deleted: {
                setState(
                    patch({
                        deletedFolders: updateItem<Folder>(folder2 => folder2.id === folder.id, folder)
                    })
                );
                break;
            }
        }
    }

    // FUNCTIONS
    @Action(AddFolder)
    async newFolder({ getState, patchState }: StateContext<FolderState>) {
        const id = await this.api.new().toPromise();
        const folders = getState().privateFolders;
        patchState({
            privateFolders: [{ id, title: '', color: FolderColorPallete.Green }, ...folders],
            countPrivate: getState().countPrivate + 1
        });
    }


    @Action(ArchiveFolders)
    async archiveFolders({ getState, patchState, dispatch }: StateContext<FolderState>, { typeFolder }: ArchiveFolders) {
        const selectedIds = getState().selectedIds;
        await this.api.archiveFolder(selectedIds, typeFolder).toPromise();

        switch (typeFolder) {
            case FolderType.Deleted: {
                const foldersDeleted = getState().deletedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().deletedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countDeleted: getState().countDeleted - selectedIds.length,
                    countArchive: getState().countArchive + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    deletedFolders: [...foldersDeleted],
                    archiveFolders: [...foldersAdded, ...getState().archiveFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
            case FolderType.Private: {
                const foldersPrivate = getState().privateFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().privateFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countPrivate: getState().countPrivate - selectedIds.length,
                    countArchive: getState().countArchive + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    privateFolders: [...foldersPrivate],
                    archiveFolders: [...foldersAdded, ...getState().archiveFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
            case FolderType.Shared: {
                const foldersShared = getState().sharedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().sharedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countShared: getState().countShared - selectedIds.length,
                    countArchive: getState().countArchive + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    sharedFolders: [...foldersShared],
                    archiveFolders: [...foldersAdded, ...getState().archiveFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
        }
    }


    @Action(ChangeColorFolder)
    async changeColor({ patchState, getState, dispatch }: StateContext<FolderState>, { color, typeFolder }: ChangeColorFolder) {

        const selectedIds = getState().selectedIds;
        await this.api.changeColor(selectedIds, color).toPromise();
        let folders: Folder[];
        switch (typeFolder) {
            case FolderType.Archive: {
                folders = getState().archiveFolders.filter(x => selectedIds.some(z => z === x.id))
                    .map(folder => { folder = { ...folder }; return folder; });
                break;
            }
            case FolderType.Private: {
                folders = getState().privateFolders.filter(x => selectedIds.some(z => z === x.id))
                    .map(folder => { folder = { ...folder }; return folder; });
                break;
            }
            case FolderType.Deleted: {
                folders = getState().deletedFolders.filter(x => selectedIds.some(z => z === x.id))
                    .map(folder => { folder = { ...folder }; return folder; });
                break;
            }
            case FolderType.Shared: {
                folders = getState().sharedFolders.filter(x => selectedIds.some(z => z === x.id))
                    .map(folder => { folder = { ...folder }; return folder; });
                break;
            }
        }
        folders.forEach(z => z.color = color);
        folders.forEach(note => dispatch(new UpdateSmallFolder(note, typeFolder)));
        const updateColor = folders.map(note => this.mapFromNoteToUpdateColor(note));
        patchState({ updateColorEvent: updateColor });
        dispatch([UnSelectAllFolder, ClearColorFolders]);
    }

    mapFromNoteToUpdateColor(note: Folder) {
        const obj: UpdateColor = {
            id: note.id,
            color: note.color
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
        await this.api.setDeleteFolder(selectedIds, typeFolder).toPromise();

        let folders;
        switch (typeFolder) {
            case FolderType.Archive: {
                folders = getState().archiveFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const deletedFolders = getState().archiveFolders.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    archiveFolders: folders,
                    deletedFolders: [...deletedFolders, ...getState().deletedFolders],
                    countArchive: folders.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds]
                });
                break;
            }
            case FolderType.Private: {
                folders = getState().privateFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const deletedNotes = getState().privateFolders.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    privateFolders: folders,
                    deletedFolders: [...deletedNotes, ...getState().deletedFolders],
                    countPrivate: folders.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds]
                });
                break;
            }
            case FolderType.Shared: {
                folders = getState().sharedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const deletedNotes = getState().sharedFolders.filter(x => selectedIds.some(z => z === x.id));
                patchState({
                    sharedFolders: folders,
                    deletedFolders: [...deletedNotes, ...getState().deletedFolders],
                    countShared: folders.length,
                    countDeleted: getState().countDeleted + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds]
                });
                break;
            }
        }
        dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
    }

    @Action(RestoreFolders)
    async restoreFolders({ getState, patchState, dispatch }: StateContext<FolderState>) {
        const selectedIds = getState().selectedIds;
        await this.api.restoreFolder(selectedIds).toPromise();
        const deletedFolders = getState().deletedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
        const addToPrivateFolders = getState().deletedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
        patchState({
            deletedFolders: [...deletedFolders],
            countDeleted: deletedFolders.length,
            countPrivate: getState().countPrivate + addToPrivateFolders.length,
            privateFolders: [...addToPrivateFolders, ...getState().privateFolders],
            removeFromMurriEvent: [...selectedIds]
        });
        dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
    }


    @Action(CopyFolders)
    async copyFolders({ getState, dispatch, patchState }: StateContext<FolderState>, { typeFolder }: CopyFolders) {
        const selectedIds = getState().selectedIds;
        const newFolders = await this.api.copyFolders(selectedIds, typeFolder).toPromise();

        switch (typeFolder) {
            case FolderType.Archive: {
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateFolders: [...newFolders, ...getState().privateFolders]
                });
                dispatch([UnSelectAllFolder]);
                break;
            }
            case FolderType.Shared: {
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateFolders: [...newFolders, ...getState().privateFolders]
                });
                dispatch([UnSelectAllFolder]);
                break;
            }
            case FolderType.Private: {
                patchState({
                    countPrivate: getState().countPrivate + selectedIds.length,
                    privateFolders: [...newFolders, ...getState().privateFolders],
                    foldersAddingPrivate: [...newFolders]
                });
                dispatch([UnSelectAllFolder, ClearAddedPrivateFolders]);
                break;
            }
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
        patchState({
            removeFromMurriEvent: [...selectedIds],
            countDeleted: getState().countDeleted - selectedIds.length
        });
        dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
    }

    @Action(MakePublicFolders)
    async MakePublicFolder({ getState, dispatch, patchState }: StateContext<FolderState>, {typeFolder}: MakePublicFolders) {
        const selectedIds = getState().selectedIds;
        await this.api.makePublicFolders(selectedIds, typeFolder).toPromise();

        switch (typeFolder) {
            case FolderType.Private: {
                const folderPrivate = getState().privateFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().privateFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countPrivate: getState().countPrivate - selectedIds.length,
                    countShared: getState().countShared + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    privateFolders: [...folderPrivate],
                    sharedFolders: [...foldersAdded, ...getState().sharedFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
            case FolderType.Archive: {
                const folderArchive = getState().archiveFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().archiveFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countArchive: getState().countArchive - selectedIds.length,
                    countShared: getState().countShared + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    archiveFolders: [...folderArchive],
                    sharedFolders: [...foldersAdded, ...getState().sharedFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
        }
    }

    @Action(MakePrivateFolders)
    async MakePrivateFolder({ getState, dispatch, patchState }: StateContext<FolderState>, {typeFolder}: MakePrivateFolders) {
        const selectedIds = getState().selectedIds;
        await this.api.makePrivateFolders(selectedIds, typeFolder).toPromise();

        switch (typeFolder) {
            case FolderType.Archive: {
                const foldersArchive = getState().archiveFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().archiveFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countArchive: getState().countArchive - selectedIds.length,
                    countPrivate: getState().countPrivate + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    archiveFolders: [...foldersArchive],
                    privateFolders: [...foldersAdded, ...getState().privateFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
            case FolderType.Shared: {
                const foldersShared = getState().sharedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? false : true);
                const foldersAdded = getState().sharedFolders.filter(x => selectedIds.indexOf(x.id) !== -1 ? true : false);
                patchState({
                    countShared: getState().countShared - selectedIds.length,
                    countPrivate: getState().countPrivate + selectedIds.length,
                    removeFromMurriEvent: [...selectedIds],
                    sharedFolders: [...foldersShared],
                    privateFolders: [...foldersAdded, ...getState().privateFolders]
                });
                dispatch([UnSelectAllFolder, RemoveFromDomMurri]);
                break;
            }
        }
    }



    @Action(PositionFolder)
    async changePosition({patchState, getState}: StateContext<FolderState>, {order, typeFolder}: PositionFolder) {
        await this.orderService.changeOrder(order).toPromise();
        switch (typeFolder) {
            case FolderType.Archive: {
                let archiveFolders = getState().archiveFolders;
                const changedFolder = archiveFolders.find(x => x.id === order.entityId);
                archiveFolders = archiveFolders.filter(x => x.id !== order.entityId);
                archiveFolders.splice(order.position - 1, 0 , changedFolder);
                patchState({archiveFolders});
                break;
            }
            case FolderType.Shared: {
                let sharedFolders = getState().sharedFolders;
                const changedFolder = sharedFolders.find(x => x.id === order.entityId);
                sharedFolders = sharedFolders.filter(x => x.id !== order.entityId);
                sharedFolders.splice(order.position - 1, 0 , changedFolder);
                patchState({sharedFolders});
                break;
            }
            case FolderType.Private: {
                let privateFolders = getState().privateFolders;
                const changedFolder = privateFolders.find(x => x.id === order.entityId);
                privateFolders = privateFolders.filter(x => x.id !== order.entityId);
                privateFolders.splice(order.position - 1, 0 , changedFolder);
                patchState({privateFolders});
                break;
            }
            case FolderType.Deleted: {
                let deletedFolders = getState().deletedFolders;
                const changedFolder = deletedFolders.find(x => x.id === order.entityId);
                deletedFolders = deletedFolders.filter(x => x.id !== order.entityId);
                deletedFolders.splice(order.position - 1, 0 , changedFolder);
                patchState({deletedFolders});
                break;
            }
        }
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
        let ids;
        switch (typeFolder) {
            case FolderType.Archive: {
                ids = getState().archiveFolders.map(x => x.id);
                break;
            }
            case FolderType.Private: {
                ids = getState().privateFolders.map(x => x.id);
                break;
            }
            case FolderType.Deleted: {
                ids = getState().deletedFolders.map(x => x.id);
                break;
            }
            case FolderType.Shared: {
                ids = getState().sharedFolders.map(x => x.id);
                break;
            }
        }
        patchState({ selectedIds: [...ids] });
    }
}
