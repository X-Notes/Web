import { ElementRef } from "@angular/core";

export enum FocusDirection {
  Up,
  Down,
}

export interface SetFocus {
  contentSection: ElementRef<HTMLElement>;
  event: KeyboardEvent;
  itemId: string;
  status: FocusDirection;
}
