import { TreeRGA } from '../../rga/tree-rga';
import { Id } from '../../rga/types';
import { TextTypeENUM } from '../../text-type.enum';
import { BlockProperty } from './block.property';
import { ProjectBlock } from './projection-block';

export class TreeBlock {
  tree: TreeRGA<string>;

  hc: BlockProperty<string> | undefined; // highlightColor

  tc: BlockProperty<string> | undefined; // textColor

  l: BlockProperty<string> | undefined; // link

  tt: BlockProperty<TextTypeENUM[]> | undefined; // textTypes

  constructor(block: Partial<TreeBlock>) {
    this.hc = block.hc;
    this.tc = block.tc;
    this.l = block.l;
    this.tt = block.tt;
    this.tree = new TreeRGA({ root: block.tree?.root, seq: block.tree?.seq ?? 0 });
  }

  static initFrom(block: TreeBlock): TreeBlock {
    const obj = new TreeBlock({ ...block });
    obj.tree = TreeRGA.initFrom(block.tree);
    return obj;
  }

  updateHighlightColor(value: BlockProperty<string>): void {
    if (
      !this.hc ||
      value.id.seq > this.hc.id.seq ||
      (value.id.seq === this.hc.id.seq && value.id.agent <= this.hc.id.agent)
    ) {
      this.hc = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
    }
  }

  updateTextColor(value: BlockProperty<string>): void {
    if (
      !this.tc ||
      value.id.seq > this.tc.id.seq ||
      (value.id.seq === this.tc.id.seq && value.id.agent <= this.tc.id.agent)
    ) {
      this.tc = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
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
      !this.tt ||
      value.id.seq > this.tt.id.seq ||
      (value.id.seq === this.tt.id.seq && value.id.agent <= this.tt.id.agent)
    ) {
      this.tt = { id: { agent: value.id.agent, seq: value.id.seq }, value: value.value };
    }
  }

  getText(): string {
    return this.tree.readStr() ?? '';
  }

  copy(): TreeBlock {
    return TreeBlock.initFrom(this);
  }

  isEqualTextTypes(textTypes: TextTypeENUM[] | undefined): boolean {
    const types = this.tt?.value;
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
      highlightColor: this.hc?.value,
      textColor: this.tc?.value,
      link: this.l?.value,
      textTypes: this.tt?.value,
      content: this.tree.readStr(),
    });
    return block;
  }

  isEqualBlock = (block: TreeBlock): boolean => {
    if (this === block) return true;
    if (block == null) return false;

    if (this.hc?.value !== block.hc?.value || !this.propIdEqual(this.hc?.id, block.hc?.id)) {
      return false;
    }

    if (this.tc?.value !== block.tc?.value || !this.propIdEqual(this.tc?.id, block.tc?.id)) {
      return false;
    }

    if (this.l?.value !== block.l?.value || !this.propIdEqual(this.l?.id, block.l?.id)) {
      return false;
    }

    if (!this.isEqualTextTypes(block.tt?.value) || !this.propIdEqual(this.tt?.id, block.tt?.id)) {
      return false;
    }

    return true;
  };

  propIdEqual(id1: Id, id2: Id): boolean {
    return id1?.agent === id2?.agent && id1?.seq === id2?.seq;
  }
}
