export class LetterDiff {
  public operation: DiffOperation;

  public str: string;

  public index: number;

  public shiftedIndex: number;

  constructor(operation: DiffOperation, str: string, index: number, shift: number) {
    this.operation = operation;
    this.str = str;
    this.index = index;
    this.shiftedIndex = shift;
  }
}

export enum DiffOperation {
  DELETE = -1,
  SAME = 0,
  ADD = 1,
}
