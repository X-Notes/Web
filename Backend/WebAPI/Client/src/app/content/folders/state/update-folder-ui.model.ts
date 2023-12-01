export class UpdateFolderUI {
  id: string;

  color: string;

  title: string;

  isUpdateTitle: boolean;

  isCanEdit: boolean;

  constructor(folderId: string) {
    this.id = folderId;
  }
}
