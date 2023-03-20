import { MergeTransaction } from '../../rga/types';
import { TextTypeENUM } from '../../text-type.enum';
import { BlockProperty } from '../blocks/block.property';

export class BlockDiff {
  highlightColor: BlockProperty<string> | undefined; // this field can be null and it`s ok, null = white;

  textColor: BlockProperty<string> | undefined; // this field can be null and it`s ok, null = white;

  link: BlockProperty<string> | undefined;

  textTypes: BlockProperty<TextTypeENUM[]> | undefined;

  mergeOps = new MergeTransaction<string>();

  get isAnyChanges(): boolean {
    const flag =
      this.highlightColor !== undefined ||
      this.textColor !== undefined ||
      this.link !== undefined ||
      !!this.textTypes?.value ||
      this.mergeOps?.ops?.length > 0;
    return flag;
  }

  setTextTypes(value: TextTypeENUM[], agent: number): void {
    if (this.textTypes) {
      let seq = this.textTypes.id.seq;
      this.textTypes = { id: { agent, seq: ++seq }, value };
      return;
    }
    this.textTypes = { id: { agent, seq: 1 }, value };
  }

  setHighlightColor(value: string, agent: number): void {
    if (this.highlightColor) {
      let seq = this.highlightColor.id.seq;
      this.highlightColor = { id: { agent, seq: ++seq }, value };
      return;
    }
    this.highlightColor = { id: { agent, seq: 1 }, value };
  }

  setTextColor(value: string, agent: number): void {
    if (this.textColor) {
      let seq = this.textColor.id.seq;
      this.textColor = { id: { agent, seq: ++seq }, value };
      return;
    }
    this.textColor = { id: { agent, seq: 1 }, value };
  }

  setLink(value: string, agent: number): void {
    if (this.link) {
      let seq = this.link.id.seq;
      this.link = { id: { agent, seq: ++seq }, value };
      return;
    }
    this.link = { id: { agent, seq: 1 }, value };
  }

  init(block: Partial<BlockDiff>): void {
    this.highlightColor = block.highlightColor;
    this.textColor = block.textColor;
    this.link = block.link;
    this.textTypes = block.textTypes;
    this.mergeOps = block.mergeOps;
  }
}
