export type TextStyles = 'bold' | 'italic' | 'color' | 'background';

export type TextUpdateValue = boolean | string;

export interface UpdateTextStyles {
  ids: string[];
  isRemoveStyles: boolean;
  textStyle: TextStyles;
  value: TextUpdateValue;
}
