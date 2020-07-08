
export class LoadLabels {
    static type = '[Labels] Load Labels';
}

export class AddLabel {
    static type = '[Labels] Add Label';
    constructor(public name: string, public color: string) {}
}

export class DeleteLabel {
    static type = '[Labels] Delete Label';
    constructor() {}
}

