import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { BaseCollection } from './base-collection';
import { BaseFile } from './base-file';

export class AudiosCollection extends BaseCollection<AudioModel> {
  constructor(collection: Partial<AudiosCollection>, items: AudioModel[]) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.items = items
      ? items.map(
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
    return new AudiosCollection(obj, obj.items);
  }

  copy(): AudiosCollection {
    return new AudiosCollection(this, this.items);
  }

  copyBase(): AudiosCollection {
    const obj = new AudiosCollection(this, this.items);
    obj.name = null;
    obj.items = null;
    return obj;
  }

  isTextOrCollectionInfoEqual(content: AudiosCollection): boolean {
    return this.name === content.name;
  }
}

export class AudioModel extends BaseFile {
  audioPath: string;

  constructor(name: string, audioPath: string, fileId: string, authorId: string, uploadAt: Date) {
    super(name, fileId, authorId, uploadAt);
    this.audioPath = audioPath;
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

export class ApiAudiosCollection extends AudiosCollection {
  audios: AudioModel[];
}
