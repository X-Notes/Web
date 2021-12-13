import { BaseText } from './editor-models/base-text';

export type TextStyles = 'bold' | 'italic';

export interface UpdateTextStyles {
  content: BaseText;
  textStyle: TextStyles;
}
