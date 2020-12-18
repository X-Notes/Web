export class ContentModel<T = Base>{
    type: ContentType;
    contentId: string;
    data: T;
}

export class Base {

}

export class Html extends Base{
    html: string;
}

export class Photos extends Base{
    photos: string[];
}


export enum ContentType{
    HTML = 'HTML',
    PHOTO = 'Photo'
}
