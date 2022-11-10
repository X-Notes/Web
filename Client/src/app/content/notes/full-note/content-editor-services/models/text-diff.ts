import { HeadingTypeENUM } from '../../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../../models/editor-models/text-models/note-text-type.enum';
import { BlockDiff } from './block-diff';

export class TextDiff {
  contentId: string;

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId?: NoteTextTypeENUM;

  checked?: boolean;

  blockDiffs: BlockDiff[] = [];

  constructor(contentId: string) {
    this.contentId = contentId;
  }

  get hasChanges(): boolean {
    return (
      this.headingTypeId !== undefined ||
      this.noteTextTypeId !== undefined ||
      this.checked !== undefined ||
      this.blockDiffs.filter((x) => x.isAnyChanges)?.length > 0
    );
  }
}
