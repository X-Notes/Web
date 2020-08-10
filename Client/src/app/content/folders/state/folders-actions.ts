import { FolderType } from 'src/app/shared/enums/FolderTypes';


export class LoadPrivateFolders {
    static type = '[Folders] Load private folders';
}

export class LoadSharedFolders {
    static type = '[Folders] Load shared folders';
}

export class LoadDeletedFolders {
    static type = '[Folders] Load deleted folders';
}

export class LoadArchiveFolders {
    static type = '[Folders] Load archive folders';
}

export class LoadAllFolders {
    static type = '[Folders] Load all folders';
}

// FUNCTIONS

export class AddFolder {
    static type = '[Folders] Add folder';
}

export class ArchiveFolders {
    static type = '[Folders] Archive folders';
    constructor(public typeFolder: FolderType) {
    }
}

// Muuri remove from dom
export class RemoveFromDomMurri {
    static type = '[Folders] MurriRemove folders';
    constructor() {
    }
}

// SELECTION
export class SelectIdFolder {
    static type = '[Folders] Select folder';
    constructor(public id: string) {    }
}

export class UnSelectIdFolder {
    static type = '[Folders] Unselect folder';
    constructor(public id: string) {    }
}

export class UnSelectAllFolder {
    static type = '[Folders] Unselect all';
    constructor() {
    }
}

export class SelectAllFolder {
    static type = '[Folders] Select all';
    constructor(public typeFolder: FolderType) {
    }
}
