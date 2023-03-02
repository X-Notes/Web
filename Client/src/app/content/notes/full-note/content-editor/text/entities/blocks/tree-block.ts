import { TreeRGA } from '../../rga/tree-rga';
import { Id } from '../../rga/types';
import { TextTypeENUM } from '../../text-type.enum';
import { BlockProperty } from './block.property';
import { ProjectBlock } from './projection-block';

export class TreeBlock {
  tree: TreeRGA<string>;

  hC: BlockProperty<string> | undefined; // highlightColor

  tC: BlockProperty<string> | undefined; // textColor

  l: BlockProperty<string> | undefined; // link

  tT: BlockProperty<TextTypeENUM[]> | undefined; // textTypes

  constructor(block: Partial<TreeBlock>) {
    this.hC = block.hC;
    this.tC = block.tC;
    this.l = block.l;
    this.tT = block.tT;
    this.tree = new TreeRGA({ root: block.tree?.root, seq: block.tree?.seq ?? 0 });
  }

  updateHighlightColor(value: BlockProperty<string>): void {
    if (
      !this.hC ||
      value.id.seq > this.hC.id.seq ||
      (value.id.seq === this.hC.id.seq && value.id.agent <= this.hC.id.agent)
    ) {
      this.hC = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
    }
  }

  updateTextColor(value: BlockProperty<string>): void {
    if (
      !this.tC ||
      value.id.seq > this.tC.id.seq ||
      (value.id.seq === this.tC.id.seq && value.id.agent <= this.tC.id.agent)
    ) {
      this.tC = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
    }
  }

  updateLink(value: BlockProperty<string>): void {
    if (
      !this.l ||
      value.id.seq > this.l.id.seq ||
      (value.id.seq === this.l.id.seq && value.id.agent <= this.l.id.agent)
    ) {
      this.l = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
    }
  }

  updateTextTypes(value: BlockProperty<TextTypeENUM[]>): void {
    if (
      !this.tT ||
      value.id.seq > this.tT.id.seq ||
      (value.id.seq === this.tT.id.seq && value.id.agent <= this.tT.id.agent)
    ) {
      this.tT = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
    }
  }

  getText(): string {
    return this.tree.readStr() ?? '';
  }

  copy(): TreeBlock {
    return new TreeBlock(this);
  }

  isEqualTextTypes(textTypes: TextTypeENUM[] | undefined): boolean {
    const types = this.tT?.value;
    if (types === textTypes) return true;
    if (types == null || textTypes == null) return false;
    if (types.length !== textTypes.length) return false;

    for (let i = 0; i < types.length; i += 1) {
      if (types[i] !== textTypes[i]) return false;
    }
    return true;
  }

  getProjection(): ProjectBlock {
    const block = new ProjectBlock({
      highlightColor: this.hC?.value,
      textColor: this.tC?.value,
      link: this.l?.value,
      textTypes: this.tT?.value,
      content: this.tree.readStr(),
    });
    return block;
  }

  isEqualBlock = (block: TreeBlock): boolean => {
    if (this === block) return true;
    if (block == null) return false;

    if (this.hC.value !== block.hC.value || !this.propIdEqual(this.hC.id, block.hC.id)) {
      return false;
    }

    if (this.tC.value !== block.tC.value || !this.propIdEqual(this.tC.id, block.tC.id)) {
      return false;
    }

    if (this.l.value !== block.l.value || !this.propIdEqual(this.l.id, block.l.id)) {
      return false;
    }

    if (!this.isEqualTextTypes(block.tT.value) || !this.propIdEqual(this.tT.id, block.tT.id)) {
      return false;
    }

    return true;
  };

  propIdEqual(id1: Id, id2: Id): boolean {
    return id1.agent === id2.agent && id1.seq === id2.seq;
  }
}
