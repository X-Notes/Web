import * as uuid from 'uuid';
import { ContentModelBase } from './content-model-base';
import { ContentTypeENUM } from './content-types.enum';

export class PhotosCollection extends ContentModelBase {
  photos: Photo[];

  name: string;

  height: string;

  width: string;

  countInRow: number;

  isLoading = false;

  constructor(collection: Partial<PhotosCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.countInRow = collection.countInRow;
    this.height = collection.height;
    this.width = collection.width;
    this.name = collection.name;
    this.photos = collection.photos
      ? collection.photos.map(
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
    return new PhotosCollection(obj);
  }

  update(entity: PhotosCollection) {
    this.name = entity.name;
    this.height = entity.height;
    this.width = entity.width;
    this.countInRow = entity.countInRow;
    this.updatedAt = entity.updatedAt;
    this.photos = entity.photos;
  }

  isEqual(content: PhotosCollection): boolean {
    return (
      this.height === content.height &&
      this.width === content.width &&
      this.countInRow === content.countInRow &&
      this.isEqualPhotos(content)
    );
  }

  copy(): PhotosCollection {
    return new PhotosCollection(this);
  }

  copyBase(): PhotosCollection {
    const obj = new PhotosCollection(this);
    obj.height = null;
    obj.width = null;
    obj.photos = null;
    obj.countInRow = null;
    return obj;
  }

  private isEqualPhotos(content: PhotosCollection): boolean {
    if (content.photos.length !== this.photos.length) {
      return false;
    }

    const ids1 = content.photos.map((x) => x.fileId);
    const ids2 = this.photos.map((x) => x.fileId);
    if (!this.isIdsEquals(ids1, ids2)) {
      return false;
    }

    for (const photoF of this.photos) {
      const photoS = content.photos.find((x) => x.fileId === photoF.fileId);
      if (!photoF.isEqual(photoS)) {
        return false;
      }
    }

    return true;
  }
}

export class Photo {
  fileId: string;

  name: string;

  photoPathSmall: string;

  photoPathMedium: string;

  photoPathBig: string;

  authorId: string;

  loaded: boolean;

  uploadAt: Date;

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
    this.fileId = fileId;
    this.photoPathSmall = photoPathSmall;
    this.photoPathMedium = photoPathMedium;
    this.photoPathBig = photoPathBig;
    this.loaded = loaded;
    this.name = name;
    this.authorId = authorId;
    this.uploadAt = uploadAt;
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
