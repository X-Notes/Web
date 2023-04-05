import { HeadingTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { BaseUndoAction } from './base-undo-action';
import { UndoActionTypeEnum } from './undo-action-type.enum';

export class UpdateTextTypeAction extends BaseUndoAction {
  constructor(
    contentId: string,
    public noteTextTypeId: NoteTextTypeENUM,
    public headingTypeId?: HeadingTypeENUM,
    public checked?: boolean,
  ) {
    super(UndoActionTypeEnum.mutateTextType, contentId);
  }
}
