import { ParentInteractionHTML } from "../../components/parent-interaction.interface";

export type TextStyles = 'bold' | 'italic' | 'color' | 'background' | 'link';

export type TextUpdateValue = boolean | string;

export interface UpdateTextStyles {
  contents: ParentInteractionHTML[];
  textStyle: TextStyles;
  value: TextUpdateValue;
}
