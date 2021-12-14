import { BaseText } from './editor-models/base-text';

export type TextStyles = 'bold' | 'italic';

export enum UpdateStyleMode {
  Remove,
  Add,
}

export interface UpdateTextStyles {
  content: BaseText;
  textStyle: TextStyles;
  updateMode: UpdateStyleMode;
}
