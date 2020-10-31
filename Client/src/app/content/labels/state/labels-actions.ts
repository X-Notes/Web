import { Label } from '../models/label';
import { Order } from 'src/app/shared/services/order.service';

export class LoadLabels {
    static type = '[Labels] Load Labels';
}

export class AddLabel {
    static type = '[Labels] Add Label';
    constructor() {}
}

export class SetDeleteLabel {
    static type = '[Labels] SetDelete Label';
    constructor(public label: Label) {}
}

export class DeleteLabel {
    static type = '[Labels] Delete Label';
    constructor(public label: Label) {}
}

export class UpdateLabel {
    static type = '[Labels] Update Label';
    constructor(public label: Label) {}
}

export class PositionLabel {
    static type = '[Labels] Position Label';
    constructor(public deleted: boolean, public id: number, public order: Order) {}
}

export class RestoreLabel {
    static type = '[Labels] Restore Label';
    constructor(public label: Label) {}
}

export class DeleteAllFromBin {
    static type = '[Labels] Delete all from bin';
    constructor() {}
}
