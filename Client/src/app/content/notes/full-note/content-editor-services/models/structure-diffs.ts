import { BaseText } from '../../../models/content-model.model';

export class PositionDiff {
  id: string;
  order: number;

  constructor(index: number, id: string) {
    this.order = index;
    this.id = id;
  }
}

export class StructureDiffs{
  positions: PositionDiff[] = [];
  newItems: BaseText[] = [];
  removedItems: string[] = [];

  isAnyChanges(){
    return this.positions.length > 0 || this.newItems.length > 0 || this.removedItems.length > 0;
  }
}

