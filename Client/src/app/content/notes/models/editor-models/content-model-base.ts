import { BaseFile } from './base-file';
import { ContentTypeENUM } from './content-types.enum';

export abstract class ContentModelBase {
  typeId: ContentTypeENUM;

  id: string;

  updatedAt: Date;

  order: number;

  version: number;

  // UI FIELDS

  prevId?: string;

  constructor(type: ContentTypeENUM, id: string, order: number, updatedAt: Date, version: number) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = updatedAt;
    this.order = order;
    this.version = version;
  }

  transform(typeId: ContentTypeENUM): void {
    this.typeId = typeId;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  abstract get getItems(): BaseFile[];

  abstract copy(): ContentModelBase;

  abstract copyBase(): ContentModelBase;

  abstract isEqual(content: ContentModelBase): boolean;

  // abstract isEqualLite(content: ContentModelBase): boolean; Compare only by date;

  abstract patch(content: ContentModelBase);
}
