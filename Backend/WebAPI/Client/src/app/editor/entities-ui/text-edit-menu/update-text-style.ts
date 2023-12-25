import { ParentInteractionHTML } from "../../components/parent-interaction.interface";
import { SaveSelection } from "../save-selection";
import { TextStyles, TextUpdateValue } from "./update-texts-styles";

export interface UpdateTextStyle {
    content: ParentInteractionHTML;
    selection: SaveSelection;
    textStyle: TextStyles;
    value: TextUpdateValue;
}