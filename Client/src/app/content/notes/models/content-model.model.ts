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

export class Album extends ContentModel {
  photos: Photo[];

  height: string;

  width: string;

  countInRow: number;

  constructor(album: Partial<Album>) {
    super(album.typeId, album.id, album.updatedAt);
    this.countInRow = album.countInRow;
    this.height = album.height;
    this.id = album.id;
    this.photos = album.photos.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        new Photo(z.fileId, z.photoPathSmall, z.photoPathMedium, z.photoPathBig, z.loaded, z.name),
    );
  }
}

export class PlaylistModel extends ContentModel {
  name: string;

  audios: AudioModel[];
}

export class AudioModel {
  fileId: string;

  name: string;

  audioPath: string;
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

  name: string;

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
  ) {
    this.fileId = fileId;
    this.photoPathSmall = photoPathSmall;
    this.photoPathMedium = photoPathMedium;
    this.photoPathBig = photoPathBig;
    this.loaded = loaded;
    this.name = name;
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
