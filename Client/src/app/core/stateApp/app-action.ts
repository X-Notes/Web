import { EntityType } from 'src/app/shared/enums/EntityTypes';

export class UpdateRoute {
    static type = '[App] Update route';
    constructor(public type: EntityType) {    }
}



export class SpinnerChangeStatus {
    static type = '[App] Spinner status';
    constructor(public flag: boolean) {    }
}
