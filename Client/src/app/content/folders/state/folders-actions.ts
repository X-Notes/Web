import { Order } from 'src/app/shared/services/order.service';
import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { FolderType } from 'src/app/shared/models/folderType';
import { Folders } from '../models/Folders';
import { SmallFolder } from '../models/folder';

export class LoadFolders {
  static type = '[Folders] Load private folders';

  constructor(public id: string, public type: FolderType) {}
}

// FUNCTIONS

export class AddFolder {
  static type = '[Folders] Add folder';
}

export class ArchiveFolders {
  static type = '[Folders] Archive folders';

  constructor(public typeFolder: FolderType, public selectedIds: string[]) {}
}

export class ChangeColorFolder {
  static type = '[Folders] Change color folder';

  constructor(public color: string, public typeFolder: FolderType, public selectedIds: string[]) {}
}

export class ClearColorFolders {
  static type = '[Folders] Clear color folder';
}

export class UpdateFolders {
  static type = '[Folders] Update folders';

  constructor(public folders: Folders, public typeFolder: FolderTypeENUM) {}
}

export class SetDeleteFolders {
  static type = '[Folders] SetDelete folder';

  constructor(public typeFolder: FolderType, public selectedIds: string[]) {}
}

export class DeleteFoldersPermanently {
  static type = '[Folders] Delete folders';

  constructor(public selectedIds: string[], public typeNote: FolderType) {}
}

export class ClearAddedPrivateFolders {
  static type = '[Folders] ClearAddedPrivate folders';
}

export class CopyFolders {
  static type = '[Folders] Copy folders';

  constructor(public typeFolder: FolderType, public selectedIds: string[]) {}
}

export class MakePrivateFolders {
  static type = '[Folders] MakePrivate folders';

  constructor(public typeFolder: FolderType, public selectedIds: string[]) {}
}

export class PositionFolder {
  static type = '[Folders] Position folders';

  constructor(public order: Order, public typeFolder: FolderType) {}
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

  constructor(public typeFolder: FolderType) {}
}

export class UpdateTitle {
  static type = '[Folders] update title';

  constructor(public str: string, public id: string, public typeFolder: FolderType) {}
}

export class UpdateOneFolder {
  static type = '[Folders] update one one';

  constructor(public folder: SmallFolder, public typeFolder: FolderTypeENUM) {}
}

export class LoadFullFolder {
  static type = '[Folders] Load full folder';

  constructor(public id: string) {}
}

export class TransformTypeFolders {
  static type = '[Folders] transform type folders';

  constructor(
    public typeFrom: FolderTypeENUM,
    public typeTo: FolderTypeENUM,
    public selectedIds: string[],
  ) {}
}

export class ChangeTypeFullFolder {
  static type = '[Folders] change type fullFolder';

  constructor(public type: FolderType) {}
}

export class GetInvitedUsersToFolder {
  static type = '[Folders] Get InvitedUsersToFolder';

  constructor(public folderId: string) {}
}
