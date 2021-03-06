
export class ContentModel{
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


export class Album extends ContentModel{
    photos: Photo[];
}

export class Photo{
    id: string;
    url: string;
    height: string;
    width: string;
    loaded: boolean;
}

export enum HeadingType{
    H1 = 'H1',
    H2 = 'H2',
    H3 = 'H3'
}


export enum ContentType{
    DEFAULT = 'DEFAULT',
    HEADING = 'HEADING',
    DOTLIST = 'DOTLIST',
    NUMBERLIST = 'NUMBERLIST',
    CHECKLIST = 'CHECKLIST',
    ALBUM = 'ALBUM',
}
