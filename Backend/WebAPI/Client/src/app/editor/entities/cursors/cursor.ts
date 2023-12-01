import { CursorTypeENUM } from './cursor-type.enum';

export class UpdateCursor {
  entityId: string;

  type: CursorTypeENUM;

  startCursor: number;

  endCursor: number;

  color: string;

  itemId: string;

  constructor(color: string) {
    this.color = color;
  }

  initTextCursor(entityId: string, startCursor: number, endCursor: number): UpdateCursor {
    this.entityId = entityId;
    this.type = CursorTypeENUM.text;
    this.startCursor = startCursor;
    this.endCursor = endCursor;
    return this;
  }

  initCollectionItemCursor(entityId: string, itemId: string): UpdateCursor {
    this.entityId = entityId;
    this.type = CursorTypeENUM.collection;
    this.itemId = itemId;
    return this;
  }

  initTitleCursor(startCursor: number, endCursor: number): UpdateCursor {
    this.type = CursorTypeENUM.title;
    this.startCursor = startCursor;
    this.endCursor = endCursor;
    return this;
  }

  initCollectionTitleCursor(
    entityId: string,
    startCursor: number,
    endCursor: number,
  ): UpdateCursor {
    this.type = CursorTypeENUM.collectionTitle;
    this.entityId = entityId;
    this.startCursor = startCursor;
    this.endCursor = endCursor;
    return this;
  }

  initNoneCursor(): UpdateCursor {
    this.type = CursorTypeENUM.none;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static getRandomBrightColor(): string {
    const brightColors = [
      '#FF4136', // Red
      '#FF851B', // Orange
      '#FFDC00', // Yellow
      '#2ECC40', // Green
      '#0074D9', // Blue
      '#B10DC9', // Purple
      '#FF1493', // Pink
      '#F012BE', // Magenta
      '#01FF70', // Lime
      '#3D9970', // Olive
      '#39CCCC', // Teal
    ];
    return brightColors[Math.floor(Math.random() * brightColors.length)];
  }
}
