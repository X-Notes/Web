export class BaseUpdateCollectionInfoCommand {
  constructor(public noteId: string, public contentId: string, public name: string, public connectionId: string) {}
}
