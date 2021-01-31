import { ContentType, HeadingType } from './ContentMode';

export interface TransformContent{
    id: string;
    type: ContentType;
    heading?: HeadingType;
}
