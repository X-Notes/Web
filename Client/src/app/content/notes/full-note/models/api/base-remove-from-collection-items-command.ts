export class BaseRemoveFromCollectionItemsCommand {
  constructor(public noteId: string, public contentId: string, public fileIds: string[]) {}
}
