import { RefType } from 'src/app/core/models/refType';
import { FolderType } from 'src/app/shared/enums/FolderTypes';

export interface Folder {
    id: string;
    title: string;
    color: string;
    refType: RefType;
    folderType: FolderType;
    isSelected?: boolean;
    lockRedirect?: boolean;
}
