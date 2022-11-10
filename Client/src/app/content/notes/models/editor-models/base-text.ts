import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { ContentModelBase } from './content-model-base';
import { BaseFile } from './base-file';
import { TextBlock } from './text-models/text-block';
import { NoteTextTypeENUM } from './text-models/note-text-type.enum';
import { HeadingTypeENUM } from './text-models/heading-type.enum';
import { TextDiff } from '../../full-note/content-editor-services/models/text-diff';
import { BlockDiff } from '../../full-note/content-editor-services/models/block-diff';

export class BaseText extends ContentModelBase {
  listNumber?: number;

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId: NoteTextTypeENUM;

  checked?: boolean;

  contents: TextBlock[];

  listId?: number;

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.order, text.updatedAt, text.version);
    this.contents = text.contents?.map((x) => new TextBlock(x));
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
    this.listId = text.listId;
  }

  get getItems(): BaseFile[] {
    return null;
  }

  updateContent(contents: TextBlock[]) {
    this.contents = contents;
    this.updateDate();
  }

  resetToDefault(): void {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.updateNoteTextTypeId(NoteTextTypeENUM.default);
    this.updateChecked(null);
    this.updateHeadingTypeId(null);
    this.updateContent([]);
  }

  updateHeadingTypeId(headingTypeId?: HeadingTypeENUM) {
    this.headingTypeId = headingTypeId;
    this.updateDate();
  }

  updateNoteTextTypeId(noteTextTypeId: NoteTextTypeENUM) {
    this.noteTextTypeId = noteTextTypeId;
    this.updateDate();
  }

  updateChecked(_checked?: boolean) {
    this.checked = _checked;
    this.updateDate(); // TODO BUG SPACE, AFTER ENTER TEXT IS DISSPEAR
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static getNew(): BaseText {
    const obj: Partial<BaseText> = {
      typeId: ContentTypeENUM.Text,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new BaseText(obj);
  }

  copy(): BaseText {
    const obj = new BaseText(this);
    obj.contents = this.contents?.map((x) => x.copy());
    return obj;
  }

  copyBase(): BaseText {
    const obj = new BaseText(this);
    obj.contents = null;
    obj.headingTypeId = null;
    obj.noteTextTypeId = null;
    obj.checked = null;
    return obj;
  }

  isEqual(content: BaseText): boolean {
    const isEqualText = this.isEqualText(this.contents, content.contents);
    return (
      isEqualText &&
      this.headingTypeId === content.headingTypeId &&
      this.noteTextTypeId === content.noteTextTypeId &&
      this.checked === content.checked
    );
  }

  isEqualText = (blockF: TextBlock[], blockS: TextBlock[]): boolean => {
    if (blockF === blockS) return true;
    if (blockF == null || blockS == null) return false;
    if (blockF.length !== blockS.length) return false;

    for (let i = 0; i < blockF.length; i += 1) {
      if (!blockF[i].isEqual(blockS[i])) return false;
    }

    return true;
  };

  patch(text: BaseText) {
    this.contents = text.contents;
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
  }

  patchTextDiffs(diff: TextDiff): void {
    this.patchBlock(diff.blockDiffs);
    this.headingTypeId = diff.headingTypeId ?? this.headingTypeId;
    this.noteTextTypeId = diff.noteTextTypeId ?? this.noteTextTypeId;
    this.checked = diff.checked ?? this.checked;
  }

  patchBlock(blockDiffs: BlockDiff[]): void {
    if (!blockDiffs || blockDiffs?.length === 0) return;
    //
    for (let i = 0; i < blockDiffs.length; i++) {
      const diff = blockDiffs[i];
      if (i < this.contents?.length) {
        const currentBlock = this.contents[i];
        this.applyBlockDiffs(diff, currentBlock);
      } else {
        const newBlock = new TextBlock({ id: diff.id });
        this.applyBlockDiffs(diff, newBlock);
      }
    }
  }

  applyBlockDiffs(diff: BlockDiff, block: TextBlock): void {
    if (block) {
      block.highlightColor = diff.highlightColor ?? block.highlightColor;
      block.textColor = diff.textColor ?? block.textColor;
      block.link = diff.link ?? block.link;
      block.textTypes = diff.textTypes ?? block.textTypes;

      if (diff.letterIdsToDelete?.length > 0) {
        block.letters = block.letters.filter(
          (x) => !diff.letterIdsToDelete.some((q) => q === x.id),
        );
      }
      if (diff.lettersToAdd?.length > 0) {
        block.letters ??= [];
        block.letters.push(...diff.lettersToAdd);
      }
    }
  }

  getConcatedText(): string {
    return this.contents
      .map((q) => q.getTextOrdered())
      .filter((x) => x.length > 0)
      .reduce((pv, cv) => pv + cv);
  }

  isHaveText(): boolean {
    return this.contents?.some((q) => q.letters.length > 0);
  }

  private updateDate() {
    this.updatedAt = new Date();
  }
}
