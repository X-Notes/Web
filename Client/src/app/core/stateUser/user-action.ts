import { User } from '../models/user';
import { Language } from 'src/app/shared/enums/Language';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { Background } from '../models/background';

export class Login {
    static type = '[User] Login User';
    constructor(public token: string, public user: User) {    }
}

export class Logout {
    static type = '[User] Logout User';
    constructor() {  }
}

export class SetToken {
    static type = '[User] Set Token';
    constructor(public token: string) {  }
}

export class TokenSetNoUpdate {
    static type = '[User] Set noUpdateToken';
    constructor() {  }
}

export class ChangeTheme {
    static type = '[User] Change theme';
    constructor() {}
}

export class ChangeLanguage {
    static type = '[User] Change Language';
    constructor(public language: Language) {}
}

export class ChangeFontSize {
    static type = '[User] Change FontSize';
    constructor() {}
}

export class SetCurrentBackground {
    static type = '[User] setCurrent Background';
    constructor(public background: Background) {}
}

export class SetDefaultBackground {
    static type = '[User] setDefault Background';
    constructor() {}
}
