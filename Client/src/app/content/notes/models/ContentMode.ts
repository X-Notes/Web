export class ContentModel<T = Base>{
    type: ContentType;
    contentId: string;
    data: T;
}

export class Base {
}

export class HtmlText extends Base{
    content: string;
}

export class DotList extends Base{
    content: string;
}

export class NumberList extends Base{
    content: string;
}

export class CheckedList extends Base{
    checked: boolean;
    content: string;
}

export class Heading extends Base{
    content: string;
    headingType: HeadingType;
}

export class Photos extends Base{
    photos: string[];
}

export enum HeadingType{
    H1 = 'H1',
    H2 = 'H2',
    H3 = 'H3'
}

export enum ContentType{
    TEXT = 'TEXT',
    HEADING = 'HEADING',
    DOTLIST = 'DotList',
    NUMBERLIST = 'NumberList',
    CHECKLIST = 'CheckList',
    PHOTO = 'Photo',
}
