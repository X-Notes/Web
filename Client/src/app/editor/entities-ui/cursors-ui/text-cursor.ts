export class TextCursor {
  public startCursor: number;

  public endCursor: number;

  public color: string;

  constructor(startCursor: number, endCursor: number, color: string) {
    this.startCursor = startCursor;
    this.endCursor = endCursor;
    this.color = color;
  }
}
