import { HeadingTypeENUM } from "src/app/editor/entities/contents/text-models/heading-type.enum";
import { NoteTextTypeENUM } from "src/app/editor/entities/contents/text-models/note-text-type.enum";
import { ParentInteractionHTML } from "../../parent-interaction.interface";
import { SaveSelection } from "src/app/editor/entities-ui/save-selection";
import { EditorSelectionModeEnum } from "src/app/editor/entities-ui/editor-selection-mode.enum";


export interface TextEditMenuOptions {
  isBold: boolean;
  isItalic: boolean;
  textType: NoteTextTypeENUM;
  headingType: HeadingTypeENUM;
  isOneRowType: boolean;
  backgroundColor: string;
  color: string;
  link: string;
  elements: ParentInteractionHTML[];
  selection: SaveSelection;
  selectionMode: EditorSelectionModeEnum;
}
