import { Letter } from '../../../models/editor-models/text-models/letter';
import { TextType } from '../../../models/editor-models/text-models/text-type';

export class BlockDiff {
  highlightColor?: string; // this field can be null and it`s ok, null = no background;

  textColor?: string; // this field can be null and it`s ok, null = white;

  link?: string;

  textTypes?: TextType[];

  readonly letterIdsToDelete?: string[] = [];

  readonly lettersToAdd?: Letter[] = [];

  constructor(public id: string) {}

  get isAnyChanges(): boolean {
    const flag =
      this.highlightColor !== undefined ||
      this.textColor !== undefined ||
      this.link !== undefined ||
      this.textTypes !== undefined ||
      this.letterIdsToDelete?.length > 0 ||
      this.lettersToAdd?.length > 0;
    return flag;
  }
}
