import { Label } from '../models/label';

export class LoadLabels {
    static type = '[Labels] Load Labels';
}

export class AddLabel {
    static type = '[Labels] Add Label';
    constructor(public name: string, public color: string) {}
}

export class SetDeleteLabel {
    static type = '[Labels] SetDelete Label';
    constructor(public id: number) {}
}

export class DeleteLabel {
    static type = '[Labels] Delete Label';
    constructor(public id: number) {}
}

export class UpdateLabel {
    static type = '[Labels] Update Label';
    constructor(public label: Label) {}
}

export class PositionLabel {
    static type = '[Labels] Position Label';
    constructor(public labelOne: Label, public labelTwo: Label) {}
}

