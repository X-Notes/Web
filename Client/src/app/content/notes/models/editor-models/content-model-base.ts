import { ContentTypeENUM } from './content-types.enum';

export abstract class ContentModelBase {
  typeId: ContentTypeENUM;

  id: string;

  updatedAt: Date;

  order: number;

  // UI FIELDS

  prevId?: string;

  constructor(type: ContentTypeENUM, id: string, order: number, updatedAt: Date) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = updatedAt;
    this.order = order;
  }

  transform(typeId: ContentTypeENUM): void {
    this.typeId = typeId;
  }

  abstract copy(): ContentModelBase;

  abstract copyBase(): ContentModelBase;

  abstract isTextOrCollectionInfoEqual(content: ContentModelBase): boolean;

  abstract isEqual(content: ContentModelBase): boolean;

  abstract patch(content: ContentModelBase);
}
