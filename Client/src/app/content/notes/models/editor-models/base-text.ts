import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { ContentModelBase } from './content-model-base';
import { BaseFile } from './base-file';

export class BaseText extends ContentModelBase {
  listNumber?: number;

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId: NoteTextTypeENUM;

  checked?: boolean;

  contents: TextBlock[];

  listId?: number;

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.order, text.updatedAt);
    this.contents = text.contents;
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
    this.updateNoteTextTypeId(NoteTextTypeENUM.Default);
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
    return new BaseText(this);
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
    return this.isTextOrCollectionInfoEqual(content);
  }

  isTextOrCollectionInfoEqual(content: BaseText): boolean {
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

  getConcatedText(): string {
    return this.contents
      .map((z) => z.text)
      .filter((x) => x.length > 0)
      .reduce((pv, cv) => pv + cv);
  }

  isHaveText(): boolean {
    return this.contents?.some((z) => z.text.length > 0);
  }

  private updateDate() {
    this.updatedAt = new Date();
  }
}

export class TextBlock {
  text: string;

  highlightColor: string;

  textColor: string;

  textTypes: TextType[];

  isEqual(block: TextBlock): boolean {
    return (
      this.text === block.text &&
      this.highlightColor === block.highlightColor &&
      this.textColor === block.textColor &&
      this.isEqualTextTypes(block.textTypes)
    );
  }

  isEqualTextTypes(textTypes: TextType[]): boolean {
    if (this.textTypes === textTypes) return true;
    if (this.textTypes == null || textTypes == null) return false;
    if (this.textTypes.length !== textTypes.length) return false;

    for (let i = 0; i < this.textTypes.length; i += 1) {
      if (this.textTypes[i] !== textTypes[i]) return false;
    }
    return true;
  }
}

export enum TextType {
  Bold,
  Italic,
}

export enum HeadingTypeENUM {
  H1 = 1,
  H2 = 2,
  H3 = 3,
}

export enum NoteTextTypeENUM {
  Default = 1,
  Heading = 2,
  Dotlist = 3,
  Numberlist = 4,
  Checklist = 5,
}
