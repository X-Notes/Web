export class ItemToCollectionUploaded {
    static type = '[Editor] item to collection uploaded';
  
    constructor(public itemId: string, public contentId: string, public noteId: string) {}
  }