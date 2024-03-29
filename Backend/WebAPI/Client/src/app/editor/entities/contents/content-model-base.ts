import { BaseFile } from './base-file';
import { ContentTypeENUM } from './content-types.enum';

export abstract class ContentModelBase {
  typeId: ContentTypeENUM;

  id: string;

  version: number;

  updatedAt: Date;

  order: number;

  // UI FIELDS

  prevId?: string;

  constructor(type: ContentTypeENUM, id: string, order: number, updatedAt: Date, version: number) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = new Date(updatedAt);
    this.version = version;
    this.order = order;
  }

  transform(typeId: ContentTypeENUM): void {
    this.typeId = typeId;
  }

  updateDateAndVersion(version: number, updatedAt: Date): void {
    this.version = version;
    this.updatedAt = new Date(updatedAt);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  abstract get getItems(): BaseFile[];

  abstract copy(): ContentModelBase;

  abstract copyBase(): ContentModelBase;

  abstract isEqual(content: ContentModelBase): boolean;
}
