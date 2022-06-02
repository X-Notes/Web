import * as uuid from 'uuid';
import { ContentTypeENUM } from './content-types.enum';
import { BaseCollection } from './base-collection';
import { BaseFile } from './base-file';

export class AudiosCollection extends BaseCollection<AudioModel> {
  constructor(collection: Partial<AudiosCollection>, items: AudioModel[]) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.items = items ? items.map((q) => new AudioModel(q)) : [];
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

  patch(content: AudiosCollection) {
    this.name = content.name;
    this.items = content.items;
  }

  isTextOrCollectionInfoEqual(content: AudiosCollection): boolean {
    return this.name === content.name;
  }
}

export class AudioModel extends BaseFile {
  audioPath: string;

  pathToImage?: string;

  secondsDuration?: number;

  constructor(data: Partial<AudioModel>) {
    super(data);
    this.audioPath = data.audioPath;
    this.secondsDuration = data.secondsDuration;
    this.pathToImage = data.pathToImage;
  }

  isNeedUpdateMetaData(): boolean {
    return !this.secondsDuration;
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
