import { FullFolder } from './FullFolder';

export interface RequestFullFolder {
  canView: boolean;
  canEdit: boolean;
  fullFolder: FullFolder;
}
