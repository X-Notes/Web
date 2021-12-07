import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { ContentModelBase } from './content-model-base';

export class BaseText extends ContentModelBase {
  number?: number;

  contents: TextBlock[];

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId: NoteTextTypeENUM;

  checked?: boolean;

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.order, text.updatedAt);
    this.contents = text.contents;
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
  }

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
    return (
      this.isEqualText(this.contents, content.contents) &&
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
      if (blockF[i] !== blockS[i]) return false;
    }

    return true;
  };

  update(text: BaseText) {
    this.contents = text.contents;
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
    this.updatedAt = text.updatedAt;
  }

  get contentsSG(): TextBlock[] {
    return this.contents;
  }

  set contentSG(contents: TextBlock[]) {
    this.contents = contents;
    this.updateDate();
  }

  get headingTypeIdSG(): HeadingTypeENUM {
    return this.headingTypeId;
  }

  set headingTypeIdSG(headingTypeId: HeadingTypeENUM) {
    this.headingTypeId = headingTypeId;
    this.updateDate();
  }

  get noteTextTypeIdSG(): NoteTextTypeENUM {
    return this.noteTextTypeId;
  }

  set noteTextTypeIdSG(noteTextTypeId: NoteTextTypeENUM) {
    this.noteTextTypeId = noteTextTypeId;
    this.updateDate();
  }

  get checkedSG(): boolean {
    return this.checked;
  }

  set checkedSG(_checked: boolean) {
    this.checked = _checked;
    this.updateDate();
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
      this.textColor === block.textColor
    );
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
