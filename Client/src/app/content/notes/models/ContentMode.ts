export class ContentModel<T = BaseText | Photos>{
    type: ContentType;
    contentId: string;
    data: T;
}

export class BaseText {
    content: string;
}


export class HtmlText extends BaseText{
}

export class DotList extends BaseText{
}

export class NumberList extends BaseText{
    number?: number;
}

export class CheckedList extends BaseText{
    checked: boolean;
}

export class Heading extends BaseText{
    headingType: HeadingType;
}

export class Photos{
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
