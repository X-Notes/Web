import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { Label } from '../../labels/models/label.model';
import { Notes } from './notes.model';
import { SmallNote } from '../models/small-note.model';
import { PositionEntityModel } from '../models/position-note.model';
import { UpdateNoteUI } from './update-note-ui.model';
import { FullNote } from '../models/full-note.model';
import { AddNotesToDom } from './add-notes-to-dom.model';

export class LoadNoteHistories {
  static type = '[Notes] Load note histories';

  constructor(public noteId: string) {}
}

export class ResetNotes {
  static type = '[Notes] Reset notes';
}

export class ResetNotesState {
  static type = '[Notes] Reset notes state';
}

export class LoadNotes {
  static type = '[Notes] Load notes';

  constructor(public type: NoteTypeENUM, public pr: PersonalizationSetting) {}
}

export class SetFolderNotes {
  static type = '[Notes] Set folder notes';

  constructor(public notes: SmallNote[]) {}
}

export class CreateNote {
  static type = '[Notes] Create note';

  constructor(public navigateToNote: boolean) {}
}

export class CreateNoteCompleted {
  static type = '[Notes] Create note completed';

  constructor(public note: SmallNote) {}
}

export class AddNotes {
  static type = '[Notes] Add note';

  constructor(public notes: SmallNote[], public type: NoteTypeENUM) {}
}

export class UpdateNotes {
  static type = '[Notes] Update notes';

  constructor(public notes: Notes, public typeNote: NoteTypeENUM) {}
}

export class UpdateNotesCount {
  static type = '[Notes] Update notes count';

  constructor(public count: number, public typeNote: NoteTypeENUM) {}
}


export class UpdateFolderNotes {
  static type = '[Notes] Update folder notes';

  constructor(public updateNote: SmallNote) {}
}


// UPPER MENU FUNCTIONS

export class ChangeColorNote {
  static type = '[Notes] Change color note';

  constructor(
    public color: string,
    public selectedIds: string[],
    public isCallApi = true,
    public errorPermissionMessage?: string,
  ) {}
}

export class PatchUpdatesUINotes {
  static type = '[Notes] Patch UI note updates';

  constructor(public updates: UpdateNoteUI[]) {}
}

export class ClearUpdatesUINotes {
  static type = '[Notes] Remove UI note updates';
}

export class CopyNotes {
  static type = '[Notes] Copy notes';

  constructor(
    public selectedIds: string[],
    public pr: PersonalizationSetting,
    public folderId?: string,
  ) {}
}

export class LoadNotesByIds {
  static type = '[Notes] Load notes by Ids';

  constructor(public ids: string[]) {}
}

export class ClearAddToDomNotes {
  static type = '[Notes] ClearAddedPrivate notes';
}

export class AddToDomNotes {
  static type = '[Notes] Add AddToDomNotes notes';

  constructor(public notes: AddNotesToDom) {}
}

// CHANGE STATE

export class DeleteNotesPermanently {
  static type = '[Notes] Delete notes';

  isCallApi: boolean;

  constructor(public selectedIds: string[], isCallApi = true) {
    this.isCallApi = isCallApi;
  }
}

export class ChangeTypeNote {
  static type = '[Notes] change type notes';

  constructor(
    public typeTo: NoteTypeENUM,
    public selectedIds: string[],
    public isAddingToDom: boolean,
    public errorPermissionMessage?: string,
    public successCallback?: () => void,
    public refTypeId?: RefTypeENUM,
  ) {}

  get isMany() {
    return this.selectedIds.length > 1;
  }
}

export class AddLabelOnNote {
  static type = '[Notes] Add label';

  constructor(
    public labelId: string,
    public selectedIds: string[],
    public isCallApi = true,
    public errorPermissionMessage?: string,
  ) {}
}

export class RemoveLabelFromNote {
  static type = '[Notes] Remove label';

  constructor(
    public labelId: string,
    public selectedIds: string[],
    public isCallApi = true,
    public errorPermissionMessage?: string,
  ) {}
}

export class RemoveFromDomMurri {
  static type = '[Notes] MurriRemove notes';
}

export class UpdatePositionsNotes {
  static type = '[Notes] Position notes';

  constructor(public positions: PositionEntityModel[]) {}
}

export class UpdatePositionsRelatedNotes {
  static type = '[Notes] Position related notes';

  constructor(public positions: PositionEntityModel[], public noteId: string) {}
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

export class RemoveOnlineUsersOnNote {
  static type = '[Notes] Remove Online Users On Note';

  constructor(public entityId: string, public userIdentifier: string, public userId: string) {}
}

// SELECTION
export class SelectIdsNote {
  static type = '[Notes] Select note';

  constructor(public ids: string[]) {}
}

export class UnSelectIdsNote {
  static type = '[Notes] Unselect note';

  constructor(public ids: string[]) {}
}

export class UnSelectAllNote {
  static type = '[Notes] Unselect all';
}

export class SelectAllNote {
  static type = '[Notes] Select all';
}

export class UpdateOneNote {
  static type = '[Notes] update one one';

  constructor(public note: Partial<SmallNote>, public noteId: string) {}
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

  constructor(public noteId: string, public folderId: string = null) {}
}

export class LoadNotesCount {
  static type = '[Notes] Load notes count';

  constructor() {}
}

export class LoadSnapshotNote {
  static type = '[Notes] Load snapshot note';

  constructor(public snapshotId: string, public noteId: string) {}
}

export class DeleteCurrentNoteData {
  static type = '[Notes] delete full note';
}

export class UpdateNoteTitle {
  static type = '[Notes] update title';

  constructor(
    public newTitle: string,
    public noteId: string,
    public isCallApi = true,
    public errorPermissionMessage?: string
  ) {}
}

export class UpdateNoteTitleWS {
  static type = '[Notes] update note title ws';

  constructor(
    public title: string,
    public noteId: string,
    public errorPermissionMessage?: string,
  ) {}
}

export class UpdateNoteTitleState {
  static type = '[Notes] update note title state';

  constructor(
    public title: string,
    public noteId: string
  ) {}
}


export class UpdateFullNote {
  static type = '[Notes] update fullNote';

  constructor(public note: Partial<FullNote>, public noteId: string) {}
}

export class TransformTypeNotes {
  static type = '[Notes] transform type notes';

  constructor(
    public typeTo: NoteTypeENUM,
    public selectedIds: string[],
    public isAddToDom: boolean,
    public refTypeId?: RefTypeENUM,
    public deleteIds?: string[],
  ) {}
}
