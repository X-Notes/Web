import * as uuid from 'uuid';
import { BaseCollection } from './base-collection';
import { BaseFile } from './base-file';
import { ContentTypeENUM } from './content-types.enum';

export class VideosCollection extends BaseCollection<VideoModel> {
  constructor(collection: Partial<VideosCollection>, items: VideoModel[]) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.items = items
      ? items.map(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          (z) =>
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new VideoModel(
              z.name,
              z.videoPath,
              z.fileId,
              z.authorId,
              z.uploadAt,
              z.secondsDuration,
            ),
        )
      : [];
  }

  static getNew(): VideosCollection {
    const obj: Partial<VideosCollection> = {
      typeId: ContentTypeENUM.Videos,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new VideosCollection(obj, obj.items);
  }

  copy(): VideosCollection {
    return new VideosCollection(this, this.items);
  }

  copyBase(): VideosCollection {
    const obj = new VideosCollection(this, this.items);
    obj.name = null;
    obj.items = null;
    return obj;
  }

  patch(content: VideosCollection) {
    this.name = content.name;
    this.items = content.items;
  }

  isTextOrCollectionInfoEqual(content: VideosCollection): boolean {
    return this.name === content.name;
  }
}

export class VideoModel extends BaseFile {
  videoPath: string;

  secondsDuration?: number;

  constructor(
    name: string,
    videoPath: string,
    fileId: string,
    authorId: string,
    uploadAt: Date,
    secondsDuration?: number,
  ) {
    super(name, fileId, authorId, uploadAt);
    this.videoPath = videoPath;
    this.secondsDuration = secondsDuration;
  }

  isNeedUpdateMetaData(): boolean {
    return !this.secondsDuration;
  }

  isEqual(content: VideoModel): boolean {
    return (
      this.name === content.name &&
      this.fileId === content.fileId &&
      this.videoPath === content.videoPath &&
      this.authorId === content.authorId
    );
  }
}

export class ApiVideosCollection extends VideosCollection {
  videos: VideoModel[];
}
