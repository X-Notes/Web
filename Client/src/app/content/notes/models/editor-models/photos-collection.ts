import * as uuid from 'uuid';
import { BaseCollection } from './base-collection';
import { BaseFile } from './base-file';
import { ContentTypeENUM } from './content-types.enum';

export class PhotosCollection extends BaseCollection<Photo> {
  height: string;

  width: string;

  countInRow: number;

  constructor(collection: Partial<PhotosCollection>, items: Photo[]) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.countInRow = collection.countInRow;
    this.setHeightWidth(collection.height, collection.width);
    this.name = collection.name;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.items = items && items.length > 0 ? items.map((q) => new Photo(q)) : [];
  }

  static getNew(): PhotosCollection {
    const obj: Partial<PhotosCollection> = {
      typeId: ContentTypeENUM.Photos,
      id: uuid.v4(),
      updatedAt: new Date(),
      countInRow: 2,
    };
    return new PhotosCollection(obj, obj.items);
  }

  updateInfo(entity: PhotosCollection) {
    this.name = entity.name;
    this.updatedAt = entity.updatedAt;

    this.setHeightWidth(entity.height, entity.width);
    this.countInRow = entity.countInRow;
  }

  isEqualCollectionInfo(content: PhotosCollection): boolean {
    return (
      this.name === content.name &&
      this.height === content.height &&
      this.width === content.width &&
      this.countInRow === content.countInRow
    );
  }

  copy(): PhotosCollection {
    return new PhotosCollection(this, this.items);
  }

  copyBase(): PhotosCollection {
    const obj = new PhotosCollection(this, this.items);
    obj.height = null;
    obj.width = null;
    obj.items = null;
    obj.countInRow = null;
    return obj;
  }

  patch(content: PhotosCollection) {
    this.name = content.name;
    this.items = content.items;
    this.height = content.height;
    this.width = content.width;
    this.countInRow = content.countInRow;
  }

  private setHeightWidth(height: string, width: string): void {
    this.height = height ?? 'auto';
    this.width = width ?? '100%';
  }
}

export class Photo extends BaseFile {
  photoPathSmall: string;

  photoPathMedium: string;

  photoPathBig: string;

  loaded: boolean;

  constructor(data: Partial<Photo>) {
    super(data);
    this.photoPathSmall = data.photoPathSmall;
    this.photoPathMedium = data.photoPathMedium;
    this.photoPathBig = data.photoPathBig;
    this.loaded = data.loaded;
  }

  get photoFromBig() {
    return this.photoPathBig ?? this.photoPathMedium ?? this.photoPathSmall;
  }

  get photoFromSmall() {
    return this.photoPathSmall ?? this.photoPathMedium ?? this.photoPathBig;
  }

  isEqual(content: Photo): boolean {
    return (
      this.name === content.name &&
      this.fileId === content.fileId &&
      this.photoPathSmall === content.photoPathSmall &&
      this.photoPathMedium === content.photoPathMedium &&
      this.photoPathBig === content.photoPathBig &&
      this.authorId === content.authorId
    );
  }
}

export class ApiPhotosCollection extends PhotosCollection {
  photos: Photo[];
}
