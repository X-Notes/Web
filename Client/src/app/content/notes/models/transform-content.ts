import { ContentType, HeadingType } from './ContentMode';

export interface TransformContent{
    id: string;
    contentType: ContentType;
    headingType?: HeadingType;
}
