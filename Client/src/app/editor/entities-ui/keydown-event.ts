import { ParentInteractionHTML } from "../components/parent-interaction.interface";
import { KeyboardKeyEnum } from "./keyboard-keys.enum";

export interface KeyDownHtmlComponent {
    content: ParentInteractionHTML;
    key: KeyboardKeyEnum;
}