import { ContentType, HeadingType } from './ContentModel';

export interface TransformContent {
  id: string;
  contentType: ContentType;
  headingType?: HeadingType;
  setFocusToEnd: boolean;
}
