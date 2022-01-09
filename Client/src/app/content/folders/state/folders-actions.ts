import { Order } from 'src/app/shared/services/order.service';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { Folders } from '../models/folders.model';
import { SmallFolder } from '../models/folder.model';

export class LoadFolders {
  static type = '[Folders] Load folders';

  constructor(public type: FolderTypeENUM, public pr: PersonalizationSetting) {}
}

export class ResetFolders {
  static type = '[Folders] Reset folders';
}

// FUNCTIONS

export class AddFolder {
  static type = '[Folders] Add folder';
}

export class ChangeTypeFolder {
  static type = '[Folders] change type folders';

  typeTo: FolderTypeENUM;

  public refTypeId: RefTypeENUM;

  public selectedIds: string[];

  public isAddingToDom: boolean;

  public errorCallback?: () => void;

  public successCallback?: () => void;

  get isMany() {
    return this.selectedIds.length > 1;
  }

  constructor(
    typeTo: FolderTypeENUM,
    selectedIds: string[],
    isAddingToDom: boolean,
    errorCallback?: () => void,
    successCallback?: () => void,
    refTypeId?: RefTypeENUM,
  ) {
    this.typeTo = typeTo;
    this.selectedIds = selectedIds;
    this.isAddingToDom = isAddingToDom;
    this.errorCallback = errorCallback;
    this.successCallback = successCallback;
    this.refTypeId = refTypeId;
  }
}
export class ChangeColorFolder {
  static type = '[Folders] Change color folder';

  isCallApi = true;

  public errorCallback?: () => void;

  constructor(
    public color: string,
    public selectedIds: string[],
    isCallApi = true,
    errorCallback?: () => void,
  ) {
    this.isCallApi = isCallApi;
    this.errorCallback = errorCallback;
  }
}

export class ClearUpdatesUIFolders {
  static type = '[Folders] Clear color folder';
}

// //////////////////

export class UpdateFolders {
  static type = '[Folders] Update folders';

  constructor(public folders: Folders, public typeFolder: FolderTypeENUM) {}
}

export class DeleteFoldersPermanently {
  static type = '[Folders] Delete folders';

  constructor(public selectedIds: string[], public typeNote: FolderTypeENUM) {}
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

export class PositionFolder {
  static type = '[Folders] Position folders';

  constructor(public order: Order, public typeFolder: FolderTypeENUM) {}
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

  constructor(
    public str: string,
    public folderId: string,
    public isCallApi = true,
    public errorCallback?: () => void,
  ) {}
}

export class UpdateOneFolder {
  static type = '[Folders] update one one';

  constructor(public folder: SmallFolder) {}
}

export class LoadFullFolder {
  static type = '[Folders] Load full folder';

  constructor(public id: string) {}
}

export class TransformTypeFolders {
  static type = '[Folders] transform type folders';

  refTypeId?: RefTypeENUM;

  constructor(
    public typeTo: FolderTypeENUM,
    public selectedIds: string[],
    public isAddToDom: boolean,
    refTypeId?: RefTypeENUM,
  ) {
    this.refTypeId = refTypeId;
  }
}

export class ChangeTypeFullFolder {
  static type = '[Folders] change type fullFolder';

  constructor(public type: FolderTypeENUM) {}
}

export class GetInvitedUsersToFolder {
  static type = '[Folders] Get InvitedUsersToFolder';

  constructor(public folderId: string) {}
}
