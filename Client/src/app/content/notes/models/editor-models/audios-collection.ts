import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { ContentModelBase } from './content-model-base';

export class AudiosCollection extends ContentModelBase {
  name: string;

  audios: AudioModel[];

  isLoading = false;

  constructor(collection: Partial<AudiosCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.audios = collection.audios
      ? collection.audios.map(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          (z) =>
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new AudioModel(z.name, z.audioPath, z.fileId, z.authorId, z.uploadAt),
        )
      : [];
  }

  static getNew(): AudiosCollection {
    const obj: Partial<AudiosCollection> = {
      typeId: ContentTypeENUM.Audios,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new AudiosCollection(obj);
  }

  update(entity: AudiosCollection) {
    this.name = entity.name;
    this.updatedAt = entity.updatedAt;
    this.audios = entity.audios;
  }

  copy(): AudiosCollection {
    return new AudiosCollection(this);
  }

  copyBase(): AudiosCollection {
    const obj = new AudiosCollection(this);
    obj.name = null;
    obj.audios = null;
    return obj;
  }

  isEqual(content: AudiosCollection): boolean {
    return this.name === content.name && this.isEqualAudios(content);
  }

  private isEqualAudios(content: AudiosCollection): boolean {
    if (content.audios.length !== this.audios.length) {
      return false;
    }

    const ids1 = content.audios.map((x) => x.fileId);
    const ids2 = this.audios.map((x) => x.fileId);
    if (!this.isIdsEquals(ids1, ids2)) {
      return false;
    }

    for (const audioF of this.audios) {
      const audioS = content.audios.find((x) => x.fileId === audioF.fileId);
      if (!audioF.isEqual(audioS)) {
        return false;
      }
    }

    return true;
  }
}

export class AudioModel {
  fileId: string;

  name: string;

  audioPath: string;

  authorId: string;

  uploadAt: Date;

  constructor(name: string, audioPath: string, fileId: string, authorId: string, uploadAt: Date) {
    this.name = name;
    this.audioPath = audioPath;
    this.fileId = fileId;
    this.authorId = authorId;
    this.uploadAt = uploadAt;
  }

  isEqual(content: AudioModel): boolean {
    return (
      this.name === content.name &&
      this.fileId === content.fileId &&
      this.audioPath === content.audioPath &&
      this.authorId === content.authorId
    );
  }
}
