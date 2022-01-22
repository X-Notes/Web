import { Order } from 'src/app/shared/services/order.service';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { Label } from '../../labels/models/label.model';
import { Notes } from './notes.model';
import { SmallNote } from '../models/small-note.model';
import { FullNote } from '../models/full-note.model';

export class ResetNotes {
  static type = '[Notes] Reset notes';
}

export class LoadNotes {
  static type = '[Notes] Load notes';

  constructor(public type: NoteTypeENUM, public pr: PersonalizationSetting) {}
}

export class AddNote {
  static type = '[Notes] Add note';
}

export class UpdateNotes {
  static type = '[Notes] Update notes';

  constructor(public notes: Notes, public typeNote: NoteTypeENUM) {}
}

// UPPER MENU FUNCTIONS

export class ChangeColorNote {
  static type = '[Notes] Change color note';

  constructor(public color: string, public selectedIds: string[]) {}
}

export class ClearColorNotes {
  static type = '[Notes] Clear color note';
}

export class CopyNotes {
  static type = '[Notes] Copy notes';

  constructor(
    public typeNote: NoteTypeENUM,
    public selectedIds: string[],
    public pr: PersonalizationSetting,
  ) {}
}

export class ClearAddToDomNotes {
  static type = '[Notes] ClearAddedPrivate notes';
}

export class AddToDomNotes {
  static type = '[Notes] Add AddToDomNotes notes';

  constructor(public notes: SmallNote[]) {}
}

// CHANGE STATE

export class DeleteNotesPermanently {
  static type = '[Notes] Delete notes';

  constructor(public selectedIds: string[], public typeNote: NoteTypeENUM) {}
}

export class BaseChangeTypeSmallNote {
  public selectedIds: string[];

  public isAddingToDom: boolean;

  public successCalback: () => void;

  constructor(isAddingToDom: boolean) {
    this.isAddingToDom = isAddingToDom;
  }

  get isMany() {
    return this.selectedIds.length > 1;
  }
}

export class SetDeleteNotes extends BaseChangeTypeSmallNote {
  static type = '[Notes] SetDelete notes';

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(isAddingToDom: boolean) {
    super(isAddingToDom);
  }
}
export class ArchiveNotes extends BaseChangeTypeSmallNote {
  static type = '[Notes] Archive notes';

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(isAddingToDom: boolean) {
    super(isAddingToDom);
  }
}

export class MakePrivateNotes extends BaseChangeTypeSmallNote {
  static type = '[Notes] MakePrivate notes';

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(isAddingToDom: boolean) {
    super(isAddingToDom);
  }
}

export class MakeSharedNotes extends BaseChangeTypeSmallNote {
  static type = '[Notes] MakeShared notes';

  refTypeId: RefTypeENUM;

  constructor(isAddingToDom: boolean, refTypeId: RefTypeENUM) {
    super(isAddingToDom);
    this.refTypeId = refTypeId;
  }
}

// Labels

export class UpdateLabelOnNote {
  static type = '[Notes] Update label';

  constructor(public label: Label) {}
}

export class AddLabelOnNote {
  static type = '[Notes] Add label';

  constructor(public label: Label, public typeNote: NoteTypeENUM, public selectedIds: string[]) {}
}

export class RemoveLabelFromNote {
  static type = '[Notes] Remove label';

  constructor(public label: Label, public typeNote: NoteTypeENUM, public selectedIds: string[]) {}
}

export class ClearUpdatelabelEvent {
  static type = '[Notes] Clear labels';
}

export class RemoveFromDomMurri {
  static type = '[Notes] MurriRemove notes';
}

export class PositionNote {
  static type = '[Notes] Position notes';

  constructor(public order: Order, public typeNote: NoteTypeENUM) {}
}

// SHARING

export class GetInvitedUsersToNote {
  static type = '[Notes] Get InvitedUsersToNote';

  constructor(public noteId: string) {}
}

export class LoadOnlineUsersOnNote {
  static type = '[Notes] Get OnlineUsersOnNote';

  constructor(public noteId: string) {}
}

// SELECTION
export class SelectIdNote {
  static type = '[Notes] Select note';

  constructor(public id: string) {}
}

export class UnSelectIdNote {
  static type = '[Notes] Unselect note';

  constructor(public id: string) {}
}

export class UnSelectAllNote {
  static type = '[Notes] Unselect all';
}

export class SelectAllNote {
  static type = '[Notes] Select all';

  constructor(public typeNote: NoteTypeENUM) {}
}

// UPDATING FROM FULL NOTE

export class UpdateOneFullNote {
  static type = '[Notes] update one full note';

  constructor(public note: FullNote) {}
}

export class UpdateOneNote {
  static type = '[Notes] update one one';

  constructor(public note: SmallNote, public typeNote: NoteTypeENUM) {}
}

export class CancelAllSelectedLabels {
  static type = '[Notes] Cancel all selected labels';

  constructor(public isCanceled: boolean) {}
}

export class UpdateSelectLabel {
  static type = '[Notes] Updated selected label';

  constructor(public id: string) {}
}
// FULL NOTE

export class LoadFullNote {
  static type = '[Notes] Load full note';

  constructor(public id: string) {}
}

export class LoadSnapshotNote {
  static type = '[Notes] Load snapshot note';

  constructor(public snapshotId: string, public noteId: string) {}
}

export class DeleteCurrentNote {
  static type = '[Notes] delete full note';
}

export class UpdateTitle {
  static type = '[Notes] update title';

  constructor(public str: string) {}
}

export class UpdateLabelFullNote {
  static type = '[Notes] update label full note';

  constructor(public label: Label, public remove: boolean) {}
}

export class ChangeColorFullNote {
  static type = '[Notes] change color fullNote';

  constructor(public color: string) {}
}

export class ChangeTypeFullNote {
  static type = '[Notes] change type fullNote';

  constructor(public type: NoteTypeENUM) {}
}

export class ChangeIsLockedFullNote {
  static type = '[Notes] change isLocked fullNote';

  constructor(public isLocked: boolean) {}
}

export class TransformTypeNotes {
  static type = '[Notes] transform type notes';

  refTypeId?: RefTypeENUM;

  constructor(
    public typeTo: NoteTypeENUM,
    public selectedIds: string[],
    public isAddToDom: boolean,
    refTypeId?: RefTypeENUM,
  ) {
    this.refTypeId = refTypeId;
  }
}
