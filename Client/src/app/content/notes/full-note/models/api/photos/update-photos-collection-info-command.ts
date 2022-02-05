import { BaseUpdateCollectionInfoCommand } from '../base-update-collection-info-command';

export class UpdatePhotosCollectionInfoCommand extends BaseUpdateCollectionInfoCommand {
  constructor(
    public noteId: string,
    public contentId: string,
    public name: string,
    public count: number,
    public width: string,
    public height: string,
  ) {
    super(noteId, contentId, name);
  }
}
