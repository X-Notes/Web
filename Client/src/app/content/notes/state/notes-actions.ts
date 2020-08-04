import { FullNote } from '../models/fullNote';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { SmallNote } from '../models/smallNote';

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
    constructor(public note: SmallNote, public typeNote: NoteType) {    }
}


// UPPER MENU FUNCTIONS

// Color changing
export class ChangeColorNote {
    static type = '[Notes] Change color note';
    constructor(public color: string, public typeNote: NoteType) {    }
}

export class ClearColorNotes {
    static type = '[Notes] Clear color note';
    constructor() {    }
}

// Deleting
export class SetDeleteNotes {
    static type = '[Notes] SetDelete notes';
    constructor(public typeNote: NoteType) {
    }
}

export class SetDeleteNotesClear {
    static type = '[Notes] SetDelete notes clear';
    constructor() {
    }
}

export class DeleteNotesPermanently {
    static type = '[Notes] Delete notes';
    constructor() {
    }
}

export class DeleteNotesPermanentlyClear {
    static type = '[Notes] ClearDelete notes';
    constructor() {
    }
}


export class RestoreNotes {
    static type = '[Notes] Restore notes';
    constructor() {
    }
}
export class RestoreNotesClear {
    static type = '[Notes] ClearRestore notes';
    constructor() {
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
    constructor(public typeNote: NoteType) {
    }
}
