import { EntityType } from 'src/app/shared/enums/EntityTypes';

export class UpdateRoute {
    static type = '[App] Update route';
    constructor(public type: EntityType) {    }
}

export class SetToken {
    static type = '[App] Set Token';
    constructor(public token: string) {  }
}

export class TokenSetNoUpdate {
    static type = '[App] Set noUpdateToken';
    constructor() {  }
}

export class LoadLanguages{
    static type = '[App] Load Languages';
    constructor() {  }
}

export class LoadThemes{
    static type = '[App] Load Themes';
    constructor() {  }
}

export class LoadFontSizes{
    static type = '[App] Load FontSizes';
    constructor() {  }
}

