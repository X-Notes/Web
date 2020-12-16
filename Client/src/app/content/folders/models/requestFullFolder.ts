import { AccessType } from '../../notes/models/accessType';
import { FullFolder } from './FullFolder';


export interface RequestFullFolder {
    canView: boolean;
    accessType: AccessType;
    fullFolder: FullFolder;
}
