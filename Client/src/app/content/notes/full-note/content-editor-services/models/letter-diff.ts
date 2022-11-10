export class LetterDiff {
  constructor(public operation: DiffOperation, public str: string) {}
}

export enum DiffOperation {
  DELETE = -1,
  SAME = 0,
  ADD = 1,
}
