import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { Folders } from '../models/folders.model';
import { SmallFolder } from '../models/folder.model';
import { PositionEntityModel } from '../../notes/models/position-note.model';
import { FullFolder } from '../models/full-folder.model';
import { UpdateFolderUI } from './update-folder-ui.model';

export class LoadFolders {
  static type = '[Folders] Load folders';

  constructor(public type: FolderTypeENUM, public pr: PersonalizationSetting) {}
}

export class ResetFolders {
  static type = '[Folders] Reset folders';
}

export class ResetFoldersState {
  static type = '[Folders] Reset folders state';
}


export class UpdateFoldersCount {
  static type = '[Folders] Update folders count';

  constructor(public count: number, public typeFolder: FolderTypeENUM) {}
}


// FUNCTIONS

export class CreateFolder {
  static type = '[Folders] Create folder';
}

export class AddFolders {
  static type = '[Folders] Add folder';

  constructor(public folders: SmallFolder[], public type: FolderTypeENUM) {}
}

export class ChangeTypeFolder {
  static type = '[Folders] change type folders';

  constructor(
    public typeTo: FolderTypeENUM,
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
export class ChangeColorFolder {
  static type = '[Folders] Change color folder';

  constructor(
    public color: string,
    public selectedIds: string[],
    public isCallApi = true,
    public errorPermissionMessage?: string,
  ) {}
}

export class ClearUpdatesUIFolders {
  static type = '[Folders] Clear color folder';
}

export class PatchUpdatesUIFolders {
  static type = '[Folders] Patch UI folder updates';

  constructor(public updates: UpdateFolderUI[]) {}
}

// //////////////////

export class UpdateFolders {
  static type = '[Folders] Update folders';

  constructor(public folders: Folders, public typeFolder: FolderTypeENUM) {}
}

export class DeleteFoldersPermanently {
  static type = '[Folders] Delete folders';

  isCallApi: boolean;

  constructor(public selectedIds: string[], isCallApi = true) {
    this.isCallApi = isCallApi;
  }
}

export class ClearAddToDomFolders {
  static type = '[Folders] ClearAddedPrivate folders';
}

export class AddToDomFolders {
  static type = '[Folders] Add AddToDomFolders folders';

  constructor(public folders: SmallFolder[]) {}
}

export class CopyFolders {
  static type = '[Folders] Copy folders';

  constructor(public typeFolder: FolderTypeENUM, public selectedIds: string[]) {}
}

export class UpdatePositionsFolders {
  static type = '[Folders] Position folders';

  constructor(public positions: PositionEntityModel[]) {}
}

// Muuri remove from dom
export class RemoveFromDomMurri {
  static type = '[Folders] MurriRemove folders';
}

// SELECTION
export class SelectIdFolder {
  static type = '[Folders] Select folder';

  constructor(public id: string, public selectedIds: string[]) {}
}

export class UnSelectIdFolder {
  static type = '[Folders] Unselect folder';

  constructor(public id: string, public selectedIds: string[]) {}
}

export class UnSelectAllFolder {
  static type = '[Folders] Unselect all';
}

export class SelectAllFolder {
  static type = '[Folders] Select all';

  constructor(public typeFolder: FolderTypeENUM) {}
}

export class UpdateFolderTitle {
  static type = '[Folders] update title';

  public isCallApi = false;

  public isUpdateFullNote = false;

  public isUpdateSmallFolders = false;

  public isUpdateUI = false;

  constructor(
    public str: string,
    public folderId: string,
    public errorPermissionMessage?: string,
  ) {}

  updateSmallFolder(): UpdateFolderTitle {
    this.isCallApi = true;
    this.isUpdateSmallFolders = true;
    this.isUpdateUI = false;
    return this;
  }

  updateFullFolder(): UpdateFolderTitle {
    this.isCallApi = true;
    this.isUpdateFullNote = false;
    this.isUpdateSmallFolders = true;
    this.isUpdateUI = true;
    return this;
  }

  updateWS(): UpdateFolderTitle {
    this.isUpdateFullNote = true;
    this.isUpdateSmallFolders = true;
    this.isUpdateUI = true;
    return this;
  }
}

export class UpdateOneFolder {
  static type = '[Folders] update one one';

  constructor(public folder: Partial<SmallFolder>, public folderId: string) {}
}

export class LoadFullFolder {
  static type = '[Folders] Load full folder';

  constructor(public id: string) {}
}

export class LoadFoldersCount {
  static type = '[Folders] Load folders count';

  constructor() {}
}

export class TransformTypeFolders {
  static type = '[Folders] transform type folders';

  constructor(
    public typeTo: FolderTypeENUM,
    public selectedIds: string[],
    public isAddToDom: boolean,
    public refTypeId?: RefTypeENUM,
    public deleteIds?: string[],
  ) {}
}

export class UpdateFullFolder {
  static type = '[Folders] update fullFolder';

  constructor(public folder: Partial<FullFolder>, public folderId: string) {}
}

export class GetInvitedUsersToFolder {
  static type = '[Folders] Get InvitedUsersToFolder';

  constructor(public folderId: string) {}
}
