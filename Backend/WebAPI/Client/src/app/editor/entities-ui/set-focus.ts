export enum FocusDirection {
  Up,
  Down,
}

export interface SetFocus {
  event: KeyboardEvent;
  itemId: string;
  status: FocusDirection;
}
