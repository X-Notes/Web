export class ContentModel<T = Base>{
    type: ContentType;
    contentId: string;
    data: T;
}

export class Base {

}

export class Html extends Base{
    html: string;
    type: HtmlType;
}

export class Photos extends Base{
    photos: string[];
}


export enum ContentType{
    HTML = 'HTML',
    PHOTO = 'Photo'
}

export enum HtmlType{
    Text = 'Text',
    H1 = 'H1',
    H2 = 'H2',
    H3 = 'H3',
    DOTLIST = 'DotList',
    NUMBERLIST = 'NumberList',
    CHECKLIST = 'CheckList',
}
