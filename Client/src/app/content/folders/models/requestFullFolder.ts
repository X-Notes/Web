import { FullFolder } from './FullFolder';

export interface RequestFullFolder {
  isOwner: boolean;
  canView: boolean;
  canEdit: boolean;
  fullFolder: FullFolder;
}
