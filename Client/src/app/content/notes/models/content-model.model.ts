/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-underscore-dangle */
import * as uuid from 'uuid';

export abstract class ContentModel {
  typeId: ContentTypeENUM;

  id: string;

  updatedAt: Date;

  constructor(type: ContentTypeENUM, id: string, updatedAt: Date) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = updatedAt;
  }

  abstract copy(): ContentModel;
}

export class BaseText extends ContentModel {

  number?: number;

  private _content: string;

  private _headingTypeId?: HeadingTypeENUM;

  private _noteTextTypeId: NoteTextTypeENUM;

  private _checked?: boolean;

  private _isBold: boolean;

  private _isItalic: boolean;

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.updatedAt);
    this._content = text.content;
    this._headingTypeId = text.headingTypeId;
    this._noteTextTypeId = text.noteTextTypeId;
    this._checked = text.checked;
    this._isBold = text.isBold;
    this._isItalic = text.isItalic;
  }

  static getNew(): BaseText {
    const obj: Partial<BaseText> = {
      typeId: ContentTypeENUM.Text,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new BaseText(obj);
  }

  copy(): BaseText {
    return new BaseText(this);
  }

  get content(): string {
    return this._content;
  }

  set content(content: string) {
    this._content = content;
    this.updateDate();
  }

  get headingTypeId(): HeadingTypeENUM {
    return this._headingTypeId;
  }

  set headingTypeId(headingTypeId: HeadingTypeENUM) {
    this._headingTypeId = headingTypeId;
    this.updateDate();
  }

  get noteTextTypeId(): NoteTextTypeENUM {
    return this._noteTextTypeId;
  }

  set noteTextTypeId(noteTextTypeId: NoteTextTypeENUM) {
    this._noteTextTypeId = noteTextTypeId;
    this.updateDate();
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(_checked: boolean) {
    this._checked = _checked;
    this.updateDate();
  }

  get isBold(): boolean {
    return this._isBold;
  }

  set isBold(_isBold: boolean) {
    this._isBold = _isBold;
    this.updateDate();
  }

  get isItalic(): boolean {
    return this._isItalic;
  }

  set isItalic(_isItalic: boolean) {
    this._isItalic = _isItalic;
    this.updateDate();
  }

  private updateDate() {
    this.updatedAt = new Date();
  }
}

export class AudiosCollection extends ContentModel {
  name: string;

  audios: AudioModel[];

  constructor(collection: Partial<AudiosCollection>) {
    super(collection.typeId, collection.id, collection.updatedAt);
    this.name = collection.name;
    this.audios = collection.audios.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new AudioModel(z.name, z.audioPath, z.fileId, z.authorId),
    );
  }

  copy(): AudiosCollection {
    return new AudiosCollection(this);
  }
}

export class AudioModel {
  fileId: string;

  name: string;

  audioPath: string;

  authorId: string;

  constructor(name: string, audioPath: string, fileId: string, authorId: string) {
    this.name = name;
    this.audioPath = audioPath;
    this.fileId = fileId;
    this.authorId = authorId;
  }
}

export class VideosCollection extends ContentModel {
  name: string;

  videos: VideoModel[];

  constructor(collection: Partial<VideosCollection>) {
    super(collection.typeId, collection.id, collection.updatedAt);
    this.name = collection.name;
    this.videos = collection.videos.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new VideoModel(z.name, z.videoPath, z.fileId, z.authorId),
    );
  }

  copy(): VideosCollection {
    return new VideosCollection(this);
  }
}

export class VideoModel {
  name: string;

  videoPath: string;

  fileId: string;

  authorId: string;

  constructor(name: string, videoPath: string, fileId: string, authorId: string) {
    this.name = name;
    this.videoPath = videoPath;
    this.fileId = fileId;
    this.authorId = authorId;
  }
}

export class DocumentsCollection extends ContentModel {
  name: string;

  documents: DocumentModel[];

  constructor(collection: Partial<DocumentsCollection>) {
    super(collection.typeId, collection.id, collection.updatedAt);
    this.name = collection.name;
    this.documents = collection.documents.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new DocumentModel(z.name, z.documentPath, z.fileId, z.authorId),
    );
  }

  copy(): DocumentsCollection {
    return new DocumentsCollection(this);
  }
}

export class DocumentModel {
  name: string;

  documentPath: string;

  fileId: string;

  authorId: string;

  constructor(name: string, documentPath: string, fileId: string, authorId: string) {
    this.name = name;
    this.documentPath = documentPath;
    this.fileId = fileId;
    this.authorId = authorId;
  }
}

export class PhotosCollection extends ContentModel {
  photos: Photo[];

  height: string;

  width: string;

  countInRow: number;

  constructor(collection: Partial<PhotosCollection>) {
    super(collection.typeId, collection.id, collection.updatedAt);
    this.countInRow = collection.countInRow;
    this.height = collection.height;
    this.width = collection.width;
    this.photos = collection.photos.map(
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
        ),
    );
  }

  copy(): PhotosCollection {
    return new PhotosCollection(this);
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
  ) {
    this.fileId = fileId;
    this.photoPathSmall = photoPathSmall;
    this.photoPathMedium = photoPathMedium;
    this.photoPathBig = photoPathBig;
    this.loaded = loaded;
    this.name = name;
    this.authorId = authorId;
  }
}

export enum HeadingTypeENUM {
  H1 = 1,
  H2 = 2,
  H3 = 3,
}

export enum ContentTypeENUM {
  Text = 1,
  Photos = 2,
  Documents = 3,
  Audios = 4,
  Videos = 5,
}

export enum NoteTextTypeENUM {
  Default = 1,
  Heading = 2,
  Dotlist = 3,
  Numberlist = 4,
  Checklist = 5,
}
