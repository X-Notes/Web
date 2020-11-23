import { Order } from 'src/app/shared/services/order.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { Label } from '../../labels/models/label';
import { Notes } from './Notes';
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

export class LoadAllExceptNotes {
    static type = '[Notes] Load excepted notes';
    constructor(public typeNote: NoteType) { }
}

export class LoadAllNotes {
    static type = '[Notes] Load all notes';
}


export class AddNote {
    static type = '[Notes] Add note';
}


export class UpdateNotes {
    static type = '[Notes] Update notes';
    constructor(public notes: Notes, public typeNote: NoteType) { }
}


// UPPER MENU FUNCTIONS

export class ChangeColorNote {
    static type = '[Notes] Change color note';
    constructor(public color: string, public typeNote: NoteType, public selectedIds: string[]) { }
}

export class ClearColorNotes {
    static type = '[Notes] Clear color note';
    constructor() { }
}

export class CopyNotes {
    static type = '[Notes] Copy notes';
    constructor(public typeNote: NoteType, public selectedIds: string[]) {
    }
}

export class ClearAddedPrivateNotes {
    static type = '[Notes] ClearAddedPrivate notes';
    constructor() {
    }
}

// CHANGE STATE
export class SetDeleteNotes {
    static type = '[Notes] SetDelete notes';
    constructor(public typeNote: NoteType, public selectedIds: string[]) {
    }
}

export class DeleteNotesPermanently {
    static type = '[Notes] Delete notes';
    constructor(public selectedIds: string[]) {
    }
}

export class ArchiveNotes {
    static type = '[Notes] Archive notes';
    constructor(public typeNote: NoteType, public selectedIds: string[]) {
    }
}

export class MakePublicNotes {
    static type = '[Notes] MakePublic notes';
    constructor(public typeNote: EntityType) {
    }
}

export class MakePrivateNotes {
    static type = '[Notes] MakePrivate notes';
    constructor(public typeNote: NoteType, public selectedIds: string[]) {
    }
}


// Labels

export class UpdateLabelOnNote {
    static type = '[Notes] Update label';
    constructor(public label: Label) { }
}

export class AddLabelOnNote {
    static type = '[Notes] Add label';
    constructor(public label: Label, public typeNote: NoteType, public selectedIds: string[]) { }
}

export class RemoveLabelFromNote {
    static type = '[Notes] Remove label';
    constructor(public label: Label, public typeNote: NoteType, public selectedIds: string[]) { }
}

export class ClearUpdatelabelEvent {
    static type = '[Notes] Clear labels';
    constructor() { }
}



export class RemoveFromDomMurri {
    static type = '[Notes] MurriRemove notes';
    constructor() {
    }
}

export class PositionNote {
    static type = '[Notes] Position notes';
    constructor(public order: Order, public typeNote: NoteType) {
    }
}

// SHARING

export class GetInvitedUsersToNote {
    static type = '[Notes] Get InvitedUsersToNote';
    constructor(public noteId: string) {
    }
}

// SELECTION
export class SelectIdNote {
    static type = '[Notes] Select note';
    constructor(public id: string, public labelIds: number[]) { }
}

export class UnSelectIdNote {
    static type = '[Notes] Unselect note';
    constructor(public id: string) { }
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

// UPDATING FROM FULL NOTE

export class UpdateOneNote {
    static type = '[Notes] update one one';
    constructor(public note: SmallNote, public typeNote: NoteType) {
    }
}

export class CancelAllSelectedLabels {
    static type = '[Notes] Cancel all selected labels';
    constructor(public isCanceled: boolean) {
    }
}

export class UpdateSelectLabel {
    static type = '[Notes] Updated selected label';
    constructor(public id: number) {
    }
}
// FULL NOTE

export class LoadFullNote {
    static type = '[Notes] Load full note';
    constructor(public id: string) { }
}

export class DeleteCurrentNote {
    static type = '[Notes] delete full note';
    constructor() { }
}


export class UpdateTitle {
    static type = '[Notes] update title';
    constructor(public str: string) { }
}

export class ChangeColorFullNote {
    static type = '[Notes] change color fullNote';
    constructor(public color: string) { }
}

export class TransformTypeNotes {
    static type = '[Notes] transform type notes';
    constructor(public typeFrom: NoteType, public typeTo: NoteType, public selectedIds: string[]) { }
}



