import { RoutePathes } from 'src/app/shared/enums/RoutePathes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { EntityType } from 'src/app/shared/enums/EntityTypes';

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


export class UpdateRoute {
    static type = '[App] Update route';
    constructor(public type: EntityType) {    }
}



export class UpdateSettingsButton {
    static type = '[App] Update settings';
    constructor(public flag: boolean) {    }
}

export class UpdateNewButton {
    static type = '[App] Update new';
    constructor(public flag: boolean) {    }
}

export class UpdateSelectAllButton {
    static type = '[App] Update selectAll';
    constructor(public flag: boolean) {    }
}

export class UpdateMenuActive {
    static type = '[App] Update menu';
    constructor(public flag: boolean) {    }
}
