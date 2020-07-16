import { FullNote } from '../models/fullNote';

export class LoadSmallNotes {
    static type = '[Notes] Load small notes';
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
