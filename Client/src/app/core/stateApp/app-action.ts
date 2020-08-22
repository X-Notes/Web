import { RoutePathes } from 'src/app/shared/enums/RoutePathes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { FolderType } from 'src/app/shared/enums/FolderTypes';

export class UpdateRoutePath {
    static type = '[App] Update RoutePath';
    constructor(public routePath: RoutePathes) {    }
}

export class UpdateNoteType {
    static type = '[App] Update NoteType';
    constructor(public typeNote: NoteType) {    }
}

export class UpdateFolderType {
    static type = '[App] Update FolderType';
    constructor(public typeFolder: FolderType) {    }
}
