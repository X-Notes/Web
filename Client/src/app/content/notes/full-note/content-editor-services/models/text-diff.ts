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

  static getNewFrom(diff: Partial<TextDiff>): TextDiff {
    const obj = new TextDiff(diff.contentId);
    obj.init(diff);
    return obj;
  }

  init(diffs: Partial<TextDiff>) {
    this.headingTypeId = diffs.headingTypeId;
    this.noteTextTypeId = diffs.noteTextTypeId;
    this.checked = diffs.checked;
    const newBlocks = diffs.blockDiffs?.map((x) => {
      const obj = new BlockDiff(x.id);
      obj.init(x);
      return obj;
    });
    this.blockDiffs.push(...newBlocks);
  }
}
