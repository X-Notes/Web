import { Folder } from '../models/folder';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiFoldersService } from '../api-folders.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { FullFolder } from '../models/FullFolder';
import { LoadPrivateFolders, LoadSharedFolders, LoadArchiveFolders,
    LoadDeletedFolders, LoadAllFolders, AddFolder, SelectIdFolder,
    UnSelectIdFolder, UnSelectAllFolder, SelectAllFolder, ArchiveFolders, RemoveFromDomMurri,
    ChangeColorFolder, ClearColorFolders, UpdateSmallFolder } from './folders-actions';
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
        updateColorEvent: []
    }
})

@Injectable()
export class FolderStore {

    constructor(private api: ApiFoldersService,
                private orderService: OrderService) {
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
        await this.api.archiveNotes(selectedIds, typeFolder).toPromise();

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
