import { ContentTypeENUM } from './content-types.enum';

export abstract class ContentModelBase {
  typeId: ContentTypeENUM;

  id: string;

  updatedAt: Date;

  order: number;

  constructor(type: ContentTypeENUM, id: string, order: number, updatedAt: Date) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = updatedAt;
    this.order = order;
  }

  isIdsEquals(ids1: string[], ids2: string[]): boolean {
    const res1 = ids1.filter((name) => !ids2.includes(name));
    const res2 = ids2.filter((name) => !ids1.includes(name));
    return res1.length === 0 && res2.length === 0;
  }

  abstract copy(): ContentModelBase;

  abstract copyBase(): ContentModelBase;

  abstract isEqual(content: ContentModelBase): boolean;
}
