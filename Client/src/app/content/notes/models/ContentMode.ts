export class ContentModel {
  type: ContentType;

  id: string;

  updatedAt: Date;
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
}

export class AudioModel extends ContentModel {
  name: string;

  fileId: string;

  url: string;
}

export class VideoModel extends ContentModel {
  name: string;

  fileId: string;
}

export class DocumentModel extends ContentModel {
  name: string;

  fileId: string;
}

export class Photo {
  id: string;

  loaded: boolean;
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
