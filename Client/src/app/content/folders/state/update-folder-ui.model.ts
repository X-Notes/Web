import { TreeRGA } from "../../notes/full-note/content-editor/text/rga/tree-rga";

export class UpdateFolderUI {
  id: string;

  color: string;

  title: TreeRGA<string>;

  isUpdateTitle: boolean;

  isCanEdit: boolean;

  constructor(folderId: string) {
    this.id = folderId;
  }
}
