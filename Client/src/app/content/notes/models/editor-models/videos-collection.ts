import * as uuid from 'uuid';
import { ContentModelBase } from './content-model-base';
import { ContentTypeENUM } from './content-types.enum';

export class VideosCollection extends ContentModelBase {
  name: string;

  videos: VideoModel[];

  isLoading = false;

  constructor(collection: Partial<VideosCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.videos = collection.videos
      ? collection.videos.map(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          (z) =>
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new VideoModel(z.name, z.videoPath, z.fileId, z.authorId, z.uploadAt),
        )
      : [];
  }

  static getNew(): VideosCollection {
    const obj: Partial<VideosCollection> = {
      typeId: ContentTypeENUM.Videos,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new VideosCollection(obj);
  }

  copy(): VideosCollection {
    return new VideosCollection(this);
  }

  copyBase(): VideosCollection {
    const obj = new VideosCollection(this);
    obj.name = null;
    obj.videos = null;
    return obj;
  }

  update(entity: VideosCollection) {
    this.name = entity.name;
    this.updatedAt = entity.updatedAt;
    this.videos = entity.videos;
  }

  isEqual(content: VideosCollection): boolean {
    return this.name === content.name && this.isEqualVideos(content);
  }

  private isEqualVideos(content: VideosCollection): boolean {
    if (content.videos.length !== this.videos.length) {
      return false;
    }

    const ids1 = content.videos.map((x) => x.fileId);
    const ids2 = this.videos.map((x) => x.fileId);
    if (!this.isIdsEquals(ids1, ids2)) {
      return false;
    }

    for (const videoF of this.videos) {
      const videoS = content.videos.find((x) => x.fileId === videoF.fileId);
      if (!videoF.isEqual(videoS)) {
        return false;
      }
    }

    return true;
  }
}

export class VideoModel {
  name: string;

  videoPath: string;

  fileId: string;

  authorId: string;

  uploadAt: Date;

  constructor(name: string, videoPath: string, fileId: string, authorId: string, uploadAt: Date) {
    this.name = name;
    this.videoPath = videoPath;
    this.fileId = fileId;
    this.authorId = authorId;
    this.uploadAt = uploadAt;
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
