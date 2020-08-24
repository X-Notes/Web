import { Folder } from '../models/folder';
import { Order } from 'src/app/shared/services/order.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';


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
    constructor(public typeFolder: EntityType) {
    }
}

export class ChangeColorFolder {
    static type = '[Folders] Change color folder';
    constructor(public color: string, public typeFolder: EntityType) {    }
}

export class ClearColorFolders {
    static type = '[Folders] Clear color folder';
    constructor() {    }
}

export class UpdateSmallFolder {
    static type = '[Folders] Update small folder';
    constructor(public folder: Folder, public typeFolder: EntityType) {    }
}

export class SetDeleteFolders {
    static type = '[Folders] SetDelete folder';
    constructor(public typeFolder: EntityType) {
    }
}


export class RestoreFolders {
    static type = '[Folders] Restore folders';
    constructor() {
    }
}

export class DeleteFoldersPermanently {
    static type = '[Folders] Delete folders';
    constructor() {
    }
}

export class ClearAddedPrivateFolders {
    static type = '[Folders] ClearAddedPrivate folders';
    constructor() {
    }
}

export class CopyFolders {
    static type = '[Folders] Copy folders';
    constructor(public typeFolder: EntityType) {
    }
}

export class MakePublicFolders {
    static type = '[Folders] MakePublic folders';
    constructor(public typeFolder: EntityType) {
    }
}

export class MakePrivateFolders {
    static type = '[Folders] MakePrivate folders';
    constructor(public typeFolder: EntityType) {
    }
}

export class PositionFolder {
    static type = '[Folders] Position folders';
    constructor(public order: Order, public typeFolder: EntityType) {
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
    constructor(public typeFolder: EntityType) {
    }
}
