export class UpdateFolderUI {
  id: string;

  color: string;

  title: string;

  isCanEdit: boolean;

  constructor(folderId: string) {
    this.id = folderId;
  }
}
