import { DeltaListEnum } from '../../../converter/entities/delta-list.enum';
import { TextType } from './text-type';

export class TextBlock {
  t: string;

  hc: string;

  tc: string;

  l: string;

  tt: TextType[];

  // not mapped UI fields

  list?: DeltaListEnum;

  header?: number;

  constructor(block: Partial<TextBlock>) {
    this.t = block.t;
    this.hc = block.hc;
    this.tc = block.tc;
    this.l = block.l;
    this.tt = block.tt;
  }

  isEqual(block: TextBlock): boolean {
    return (
      this.t === block.t &&
      this.hc === block.hc &&
      this.tc === block.tc &&
      this.l === block.l &&
      this.isEqualTextTypes(block.tt)
    );
  }

  isEqualTextTypes(textTypes: TextType[]): boolean {
    if (this.tt === textTypes) return true;
    if (this.tt == null || textTypes == null) return false;
    if (this.tt.length !== textTypes.length) return false;

    for (let i = 0; i < this.tt.length; i += 1) {
      if (this.tt[i] !== textTypes[i]) return false;
    }
    return true;
  }

  copy(): TextBlock {
    return new TextBlock(this);
  }
}
