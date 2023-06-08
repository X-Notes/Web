export class TextCursorUI {
  public cursorLeft: number;

  public cursorTop: number;

  public color: string;

  constructor(cursorLeft: number, cursorTop: number, color: string) {
    this.cursorLeft = cursorLeft;
    this.cursorTop = cursorTop;
    this.color = color;
  }
}
