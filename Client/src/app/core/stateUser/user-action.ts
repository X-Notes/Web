import { User } from '../models/user';

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
