import { FullNote } from '../models/fullNote';

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
