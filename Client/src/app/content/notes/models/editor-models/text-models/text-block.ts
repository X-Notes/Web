import { DeltaListEnum } from '../../../full-note/content-editor/converter/entities/delta-list.enum';
import { TextType } from './text-type';

export class TextBlock {
  text: string;

  highlightColor: string;

  textColor: string;

  link: string;

  textTypes: TextType[];

  // not mapped UI fields

  list?: DeltaListEnum;

  constructor(block: Partial<TextBlock>) {
    this.text = block.text;
    this.highlightColor = block.highlightColor;
    this.textColor = block.textColor;
    this.link = block.link;
    this.textTypes = block.textTypes;
  }

  isEqual(block: TextBlock): boolean {
    return (
      this.text === block.text &&
      this.highlightColor === block.highlightColor &&
      this.textColor === block.textColor &&
      this.link === block.link &&
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

  copy(): TextBlock {
    return new TextBlock(this);
  }
}
