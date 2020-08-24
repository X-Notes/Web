import { EntityType } from 'src/app/shared/enums/EntityTypes';


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
