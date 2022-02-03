export enum FocusDirection {
  Up,
  Down,
}

export interface SetFocus {
  itemId: string;
  status: FocusDirection;
}
