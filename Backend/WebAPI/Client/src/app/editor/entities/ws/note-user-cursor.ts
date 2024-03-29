import { CursorTypeENUM } from "../cursors/cursor-type.enum";


export class NoteUserCursorWS {
  public entityId?: string;

  public type?: CursorTypeENUM;

  public startCursor?: number;

  public endCursor?: number;

  public color?: string;

  public itemId?: string;

  public noteId?: string;

  public userId?: string;
}
