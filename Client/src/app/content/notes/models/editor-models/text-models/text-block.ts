import { DeltaListEnum } from '../../../full-note/content-editor/converter/entities/delta-list.enum';
import { Letter } from './letter';
import { TextType } from './text-type';

export class TextBlock {
  letters: Letter[];

  highlightColor: string;

  textColor: string;

  link: string;

  textTypes: TextType[];

  version: number;

  id: string;

  // not mapped UI fields

  list?: DeltaListEnum;

  header?: number;

  constructor(block: Partial<TextBlock>) {
    console.log('constructor: ');
    this.letters = block.letters?.map((x) => new Letter(x.symbol, x.fractionalIndex, x.id)) ?? [];
    this.highlightColor = block.highlightColor;
    this.textColor = block.textColor;
    this.link = block.link;
    this.textTypes = block.textTypes;

    this.id = block.id ?? this.randomIntFromInterval(10000, 99999).toString();
  }

  get lettersOrdered(): Letter[] {
    return [...this.letters]?.sort((a, b) => a.fractionalIndex - b.fractionalIndex);
  }

  getTextOrdered(): string {
    return this.lettersOrdered.map((x) => x.symbol).join('') ?? '';
  }

  isEqual(block: TextBlock): boolean {
    return (
      this.getTextOrdered() === block.getTextOrdered() &&
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

  applyText(text: string): void {
    const letters: Letter[] = [];
    for (let index = 0; index < text.length; index++) {
      console.log('applyText: ');
      letters.push(new Letter(text[index], index, null));
    }
    this.letters = letters;
  }

  randomIntFromInterval(min, max): number {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
