import { EntityRef } from 'src/app/shared/models/entityRef';
import { FolderType } from 'src/app/shared/models/folderType';

export interface FullFolder {
    id: string;
    title: string;
    color: string;
    refType: EntityRef;
    folderType: FolderType;
}
