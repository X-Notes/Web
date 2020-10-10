import { AccessType } from './accessType';
import { FullNote } from './fullNote';

export interface RequestFullNote {
    canView: boolean;
    accessType: AccessType;
    fullNote: FullNote;
}
