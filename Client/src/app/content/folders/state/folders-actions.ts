import { Order } from 'src/app/shared/services/order.service';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { Folders } from '../models/Folders';
import { Folder } from '../models/folder';


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

export class LoadAllExceptFolders {
    static type = '[Folders] Load all folders';
    constructor(public typeFolder: FolderType) {    }
}

// FUNCTIONS

export class AddFolder {
    static type = '[Folders] Add folder';
}

export class ArchiveFolders {
    static type = '[Folders] Archive folders';
    constructor(public typeFolder: FolderType, public selectedIds: string[]) {
    }
}

export class ChangeColorFolder {
    static type = '[Folders] Change color folder';
    constructor(public color: string, public typeFolder: FolderType, public selectedIds: string[]) {    }
}

export class ClearColorFolders {
    static type = '[Folders] Clear color folder';
    constructor() {    }
}

export class UpdateFolders {
    static type = '[Folders] Update folders';
    constructor(public folders: Folders, public typeFolder: FolderType) { }
}


export class SetDeleteFolders {
    static type = '[Folders] SetDelete folder';
    constructor(public typeFolder: FolderType, public selectedIds: string[]) {
    }
}


export class DeleteFoldersPermanently {
    static type = '[Folders] Delete folders';
    constructor(public selectedIds: string[]) {
    }
}

export class ClearAddedPrivateFolders {
    static type = '[Folders] ClearAddedPrivate folders';
    constructor() {
    }
}

export class CopyFolders {
    static type = '[Folders] Copy folders';
    constructor(public typeFolder: FolderType, public selectedIds: string[]) {
    }
}


export class MakePrivateFolders {
    static type = '[Folders] MakePrivate folders';
    constructor(public typeFolder: FolderType, public selectedIds: string[]) {
    }
}

export class PositionFolder {
    static type = '[Folders] Position folders';
    constructor(public order: Order, public typeFolder: FolderType) {
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
    constructor(public id: string, public selectedIds: string[]) {    }
}

export class UnSelectIdFolder {
    static type = '[Folders] Unselect folder';
    constructor(public id: string, public selectedIds: string[]) {    }
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


export class UpdateTitle {
    static type = '[Folders] update title';
    constructor(public str: string, public id: string, public typeFolder: FolderType) { }
}

export class UpdateOneFolder {
    static type = '[Folders] update one one';
    constructor(public folder: Folder, public typeFolder: FolderType) {
    }
}
