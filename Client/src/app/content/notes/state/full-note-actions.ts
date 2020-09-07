

export class LoadFullNote {
    static type = '[FullNote] Load full note';
    constructor(public id: string) { }
}

export class DeleteCurrentNote {
    static type = '[FullNote] delete full note';
    constructor() { }
}
