import { DeltaListEnum } from '../../../converter/entities/delta-list.enum';
import { TextTypeENUM } from '../../text-type.enum';

export class ProjectBlock {
  highlightColor: string | null | undefined;

  textColor: string | null | undefined;

  link: string | null | undefined;

  textTypes: TextTypeENUM[] | undefined;

  // not mapped UI fields

  list?: DeltaListEnum | null | undefined;

  header?: number | null | undefined;

  content?: string; // plain text

  constructor(block: Partial<ProjectBlock>) {
    this.highlightColor = block.highlightColor;
    this.textColor = block.textColor;
    this.link = block.link;
    this.textTypes = block.textTypes;
    this.content = block.content;
  }

  getText(): string {
    return this.content ?? '';
  }

  copy(): ProjectBlock {
    return new ProjectBlock(this);
  }
}
