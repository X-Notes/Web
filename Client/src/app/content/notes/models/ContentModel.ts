export class ContentModel {
  type: ContentType;

  id: string;

  updatedAt: Date;

  constructor(type: ContentType, id: string, updatedAt: Date) {
    this.type = type;
    this.id = id;
    this.updatedAt = updatedAt;
  }
}

export class BaseText extends ContentModel {
  content: string;

  headingType: HeadingType;

  checked: boolean;

  number?: number;
}

export class Album extends ContentModel {
  photos: Photo[];

  height: string;

  width: string;

  countInRow: number;

  constructor(album: Partial<Album>) {
    super(album.type, album.id, album.updatedAt);
    this.countInRow = album.countInRow;
    this.height = album.height;
    this.id = album.id;
    this.photos = album.photos.map(
      (z) => new Photo(z.fileId, z.photoPathSmall, z.photoPathMedium, z.photoPathBig, z.loaded),
    );
  }
}

export class AudioModel extends ContentModel {
  name: string;

  audioPath: string;

  fileId: string;
}

export class VideoModel extends ContentModel {
  name: string;

  videoPath: string;

  fileId: string;
}

export class DocumentModel extends ContentModel {
  name: string;

  documentPath: string;

  fileId: string;
}

export class Photo {
  fileId: string;

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
  ) {
    this.fileId = fileId;
    this.photoPathSmall = photoPathSmall;
    this.photoPathMedium = photoPathMedium;
    this.photoPathBig = photoPathBig;
    this.loaded = loaded;
  }
}

export enum HeadingType {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
}

export enum ContentType {
  DEFAULT = 'default',
  HEADING = 'heading',
  DOTLIST = 'dotlist',
  NUMBERLIST = 'numberlist',
  CHECKLIST = 'checklist',
  ALBUM = 'album',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
}
