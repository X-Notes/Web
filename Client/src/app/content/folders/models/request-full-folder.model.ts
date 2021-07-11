import { FullFolder } from './full-folder.model';

export interface RequestFullFolder {
  isOwner: boolean;
  canView: boolean;
  canEdit: boolean;
  fullFolder: FullFolder;
}
