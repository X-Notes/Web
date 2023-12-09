import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { ContentModelBase } from './content-model-base';
import { BaseFile } from './base-file';
import { TextBlock } from './text-models/text-block';
import { NoteTextTypeENUM } from './text-models/note-text-type.enum';
import { HeadingTypeENUM } from './text-models/heading-type.enum';
import { TextMetadata } from './text-models/text-metadata';

export class BaseText extends ContentModelBase {
  listNumber?: number;

  metadata: TextMetadata;

  contents: TextBlock[];

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.order, text.updatedAt, text.version);
    this.contents = text.contents?.map((x) => new TextBlock(x));
    const type = text.metadata?.noteTextTypeId ?? NoteTextTypeENUM.default;
    this.metadata = new TextMetadata(type, text.metadata?.hTypeId, text.metadata?.checked, text.metadata?.tabCount);
  }

  get getItems(): BaseFile[] {
    return null;
  }

  updateContent(contents: TextBlock[]) {
    this.contents = contents;
  }

  resetToDefault(): void {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.updateNoteTextTypeId(NoteTextTypeENUM.default);
    this.updateChecked(null);
    this.updateHeadingTypeId(null);
    this.updateContent([]);
  }

  updateHeadingTypeId(hTypeId?: HeadingTypeENUM) {
    this.metadata.hTypeId = hTypeId;
  }

  updateNoteTextTypeId(noteTextTypeId: NoteTextTypeENUM) {
    this.metadata.noteTextTypeId = noteTextTypeId;
  }

  updateChecked(_checked?: boolean) {
    this.metadata.checked = _checked;
  }

  updateTabCount(tabCount: number) {
    this.metadata.tabCount = tabCount;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static getNew(): BaseText {
    const obj: Partial<BaseText> = {
      typeId: ContentTypeENUM.Text,
      id: uuid.v4()
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
    obj.metadata = null;
    return obj;
  }

  isEqual(content: BaseText): boolean {
    const isEqualText = this.isEqualText(this.contents, content.contents);
    return (isEqualText && this.metadata.isEqual(content.metadata));
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

  patch(blocks: TextBlock[], metadata: TextMetadata, version: number, updateDate: Date) {
    this.contents = blocks;
    this.metadata.hTypeId = metadata.hTypeId;
    this.metadata.noteTextTypeId = metadata.noteTextTypeId;
    this.metadata.checked = metadata.checked;
    this.metadata.tabCount = metadata.tabCount;
    this.updateDateAndVersion(version, updateDate);
  }

  getConcatedText(): string {
    return this.contents
      .map((q) => q.t)
      .filter((x) => x.length > 0)
      .reduce((pv, cv) => pv + cv);
  }

  isHaveText(): boolean {
    return this.contents?.some((q) => q.t.length > 0);
  }
}
