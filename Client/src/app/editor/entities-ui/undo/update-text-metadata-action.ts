import { TextMetadata } from '../../entities/contents/text-models/text-metadata';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class UpdateTextTypeAction extends BaseUndoAction {

  public metadata: TextMetadata;

  constructor(
    contentId: string,
    metadata: TextMetadata
  ) {
    super(UndoActionTypeEnum.mutateTextMetadata, contentId);
    this.metadata = new TextMetadata(metadata.noteTextTypeId, metadata.hTypeId, metadata.checked, metadata.tabCount);
  }
}
