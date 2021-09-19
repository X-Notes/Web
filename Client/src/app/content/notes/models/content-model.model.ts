export class ContentModel {
  typeId: ContentTypeENUM;

  id: string;

  updatedAt: Date;

  constructor(type: ContentTypeENUM, id: string, updatedAt: Date) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = updatedAt;
  }
}

export class BaseText extends ContentModel {
  content: string;

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId: NoteTextTypeENUM;

  checked?: boolean;

  isBold: boolean;

  isItalic: boolean;

  number?: number;
}

export class AudiosCollection extends ContentModel {
  name: string;

  audios: AudioModel[];
}

export class AudioModel {
  fileId: string;

  name: string;

  audioPath: string;

  authorId: string;
}


export class VideosCollection extends ContentModel {
  name: string;

  videos: VideoModel[];
}

export class VideoModel {
  name: string;

  videoPath: string;

  fileId: string;

  authorId: string;
}

export class DocumentsCollection extends ContentModel {
  name: string;

  documents: DocumentModel[];
}

export class DocumentModel {
  name: string;

  documentPath: string;

  fileId: string;

  authorId: string;
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
    this.id = collection.id;
    this.photos = collection.photos.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
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
  NoteAlbum = 2,
  Document = 3,
  Audio = 4,
  Video = 5,
}

export enum NoteTextTypeENUM {
  Default = 1,
  Heading = 2,
  Dotlist = 3,
  Numberlist = 4,
  Checklist = 5,
}
