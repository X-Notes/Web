import { FolderTypeENUM } from 'src/app/shared/enums/FolderTypesEnum';
import { RefTypeENUM } from 'src/app/shared/enums/refTypeEnum';

export interface FullFolder {
  id: string;
  title: string;
  color: string;
  refTypeId: RefTypeENUM;
  folderTypeId: FolderTypeENUM;
}
