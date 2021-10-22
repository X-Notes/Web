import { BaseText } from '../../../models/content-model.model';


export class NewRowDiff {
  order: number;

  data: BaseText;

  constructor(index: number, data: BaseText) {
    this.order = index;
    this.data = data;
  }
}

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
  newItems: NewRowDiff[] = [];
  removedItems: string[] = [];

  isAnyChanges(){
    return this.positions.length > 0 || this.newItems.length > 0 || this.removedItems.length > 0;
  }
}

