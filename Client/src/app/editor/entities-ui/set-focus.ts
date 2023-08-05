import { SelectionInfo } from "../ui-services/selection.service";

export enum FocusDirection {
  Up,
  Down,
}

export interface SetFocus {
  event: KeyboardEvent;
  itemId: string;
  status: FocusDirection;
  selection: SelectionInfo; 
}
