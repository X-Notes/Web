export class ContentModel {
  type: ContentType;

  id: string;

  nextId: string;

  prevId: string;
}

export class BaseText extends ContentModel {
  content: string;

  headingType: HeadingType;

  checked: boolean;

  number?: number;
}

export class Album extends ContentModel {
  photos: Photo[];
}

export class Photo {
  id: string;

  url: string;

  height: string;

  width: string;

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
}
