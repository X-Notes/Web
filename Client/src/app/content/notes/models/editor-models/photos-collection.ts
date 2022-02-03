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
    this.height = collection.height;
    this.width = collection.width;
    this.name = collection.name;
    this.items = items
      ? items.map(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          (z) =>
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new Photo(
              z.fileId,
              z.photoPathSmall,
              z.photoPathMedium,
              z.photoPathBig,
              z.loaded,
              z.name,
              z.authorId,
              z.uploadAt,
            ),
        )
      : [];
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

    this.height = entity.height;
    this.width = entity.width;
    this.countInRow = entity.countInRow;
  }

  isTextOrCollectionInfoEqual(content: PhotosCollection): boolean {
    return this.name === content.name && 
    this.height === content.height && 
    this.width === content.width && 
    this.countInRow === content.countInRow;
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
}

export class Photo extends BaseFile {

  photoPathSmall: string;

  photoPathMedium: string;

  photoPathBig: string;

  loaded: boolean;

  get photoFromBig() {
    return this.photoPathBig ?? this.photoPathMedium ?? this.photoPathSmall;
  }

  get photoFromSmall() {
    return this.photoPathSmall ?? this.photoPathMedium ?? this.photoPathBig;
  }

  constructor(
    fileId: string,
    photoPathSmall: string,
    photoPathMedium: string,
    photoPathBig: string,
    loaded: boolean,
    name: string,
    authorId: string,
    uploadAt: Date,
  ) {
    super(name, fileId, authorId, uploadAt);
    this.photoPathSmall = photoPathSmall;
    this.photoPathMedium = photoPathMedium;
    this.photoPathBig = photoPathBig;
    this.loaded = loaded;
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
