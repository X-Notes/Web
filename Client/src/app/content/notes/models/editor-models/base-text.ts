import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { ContentModelBase } from './content-model-base';
import { BaseFile } from './base-file';
import { HeadingTypeENUM } from '../../full-note/content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../../full-note/content-editor/text/note-text-type.enum';
import { TreeBlock } from '../../full-note/content-editor/text/entities/blocks/tree-block';
import { BlockDiff } from '../../full-note/content-editor/text/entities/diffs/block-diff';
import { ProjectBlock } from '../../full-note/content-editor/text/entities/blocks/projection-block';
import { TextDiff } from '../../full-note/content-editor-services/models/text-diff';

export class BaseText extends ContentModelBase {
  listNumber?: number;

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId: NoteTextTypeENUM;

  checked?: boolean;

  contents: TreeBlock[];

  contentsUI: ProjectBlock[];

  listId?: number;

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.order, text.updatedAt, text.version);
    this.contents = text.contents?.map((x) => new TreeBlock(x));
    this.contentsUI = this.contents?.map((x) => x.getProjection());
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
    this.listId = text.listId;
  }

  get getItems(): BaseFile[] {
    return null;
  }

  updateContent(contents: ProjectBlock[]) {
    this.contentsUI = contents;
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
    const isEqualText = this.isEqualBlock(this.contents, content.contents);
    return (
      isEqualText &&
      this.headingTypeId === content.headingTypeId &&
      this.noteTextTypeId === content.noteTextTypeId &&
      this.checked === content.checked
    );
  }

  isEqualBlock = (blockF: TreeBlock[], blockS: TreeBlock[]): boolean => {
    if (blockF === blockS) return true;
    if (blockF == null || blockS == null) return false;
    if (blockF.length !== blockS.length) return false;

    for (let i = 0; i < blockF.length; i += 1) {
      if (!blockF[i].isEqualBlock(blockS[i])) return false;
    }

    return true;
  };

  patch(text: BaseText) {
    this.contents = text.contents;
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
  }

  ///

  patchTextDiffs(diff: TextDiff): void {
    this.processDiffsTextAndProps(diff.blockDiffs, this.contents);
    this.headingTypeId = diff.headingTypeId ?? this.headingTypeId;
    this.noteTextTypeId = diff.noteTextTypeId ?? this.noteTextTypeId;
    this.checked = diff.checked ?? this.checked;
  }

  processDiffsTextAndProps(blockDiffs: BlockDiff[], stateBlocks: TreeBlock[]): void {
    if (!blockDiffs) return;
    this.alignBlocks(blockDiffs, stateBlocks);
    this.processText(blockDiffs, stateBlocks);
    this.processProps(blockDiffs, stateBlocks);
  }

  processDiffsProps(blockDiffs: BlockDiff[], stateBlocks: TreeBlock[]): void {
    if (!blockDiffs) return;
    this.alignBlocks(blockDiffs, stateBlocks);
    this.processProps(blockDiffs, stateBlocks);
  }

  processProps(blockDiffs: BlockDiff[], stateBlocks: TreeBlock[]): void {
    for (let i = 0; i < blockDiffs.length; i++) {
      const diffs = blockDiffs[i];
      const stateBlock = stateBlocks[i];

      if (diffs.highlightColor) {
        stateBlock.updateHighlightColor(diffs.highlightColor);
      }
      if (diffs.link) {
        stateBlock.updateLink(diffs.link);
      }
      if (diffs.textColor) {
        stateBlock.updateTextColor(diffs.textColor);
      }
      if (diffs.textTypes) {
        stateBlock.updateTextTypes(diffs.textTypes);
      }
    }
  }

  processText(blockDiffs: BlockDiff[], stateBlocks: TreeBlock[]): void {
    for (let i = 0; i < blockDiffs.length; i++) {
      const diffs = blockDiffs[i];
      const stateBlock = stateBlocks[i];
      stateBlock.tree.merge([diffs.mergeOps]);
    }
  }

  alignBlocks(blockDiffs: BlockDiff[], stateBlocks: TreeBlock[]): void {
    for (let i = 0; i < blockDiffs.length; i++) {
      if (i >= stateBlocks.length) {
        stateBlocks.push(new TreeBlock({}));
      }
    }
  }

  getUIConcatedText(): string {
    return this.contentsUI
      .map((q) => q.getText())
      .filter((x) => x.length > 0)
      .reduce((pv, cv) => pv + cv);
  }

  isHaveUIText(): boolean {
    return this.getUIConcatedText()?.length > 0;
  }

  private updateDate() {
    this.updatedAt = new Date();
  }
}
