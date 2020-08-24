import { FullNote } from '../models/fullNote';
import { SmallNote } from '../models/smallNote';
import { Order } from 'src/app/shared/services/order.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';

export class LoadPrivateNotes {
    static type = '[Notes] Load private notes';
}

export class LoadSharedNotes {
    static type = '[Notes] Load shared notes';
}

export class LoadDeletedNotes {
    static type = '[Notes] Load deleted notes';
}

export class LoadArchiveNotes {
    static type = '[Notes] Load archive notes';
}

export class LoadAllNotes {
    static type = '[Notes] Load all notes';
}


export class LoadFullNote {
    static type = '[Notes] Load full note';
    constructor(public id: string) {    }
}

export class AddNote {
    static type = '[Notes] Add note';
}

export class UpdateFullNote {
    static type = '[Notes] Update full note';
    constructor(public note: FullNote) {    }
}

export class UpdateSmallNote {
    static type = '[Notes] Update small note';
    constructor(public note: SmallNote, public typeNote: EntityType) {    }
}


// UPPER MENU FUNCTIONS

// Color changing
export class ChangeColorNote {
    static type = '[Notes] Change color note';
    constructor(public color: string, public typeNote: EntityType) {    }
}

export class ClearColorNotes {
    static type = '[Notes] Clear color note';
    constructor() {    }
}

// Set Deleting
export class SetDeleteNotes {
    static type = '[Notes] SetDelete notes';
    constructor(public typeNote: EntityType) {
    }
}

// Deleting
export class DeleteNotesPermanently {
    static type = '[Notes] Delete notes';
    constructor() {
    }
}

// Restoring
export class RestoreNotes {
    static type = '[Notes] Restore notes';
    constructor() {
    }
}

// Archive
export class ArchiveNotes {
    static type = '[Notes] Archive notes';
    constructor(public typeNote: EntityType) {
    }
}

export class MakePublicNotes {
    static type = '[Notes] MakePublic notes';
    constructor(public typeNote: EntityType) {
    }
}

export class MakePrivateNotes {
    static type = '[Notes] MakePrivate notes';
    constructor(public typeNote: EntityType) {
    }
}

export class CopyNotes {
    static type = '[Notes] Copy notes';
    constructor(public typeNote: EntityType) {
    }
}

export class ClearAddedPrivateNotes {
    static type = '[Notes] ClearAddedPrivate notes';
    constructor() {
    }
}

// Muuri remove from dom
export class RemoveFromDomMurri {
    static type = '[Notes] MurriRemove notes';
    constructor() {
    }
}

export class PositionNote {
    static type = '[Notes] Position notes';
    constructor(public order: Order, public typeNote: EntityType) {
    }
}

// SELECTION
export class SelectIdNote {
    static type = '[Notes] Select note';
    constructor(public id: string) {    }
}

export class UnSelectIdNote {
    static type = '[Notes] Unselect note';
    constructor(public id: string) {    }
}

export class UnSelectAllNote {
    static type = '[Notes] Unselect all';
    constructor() {
    }
}

export class SelectAllNote {
    static type = '[Notes] Select all';
    constructor(public typeNote: EntityType) {
    }
}
