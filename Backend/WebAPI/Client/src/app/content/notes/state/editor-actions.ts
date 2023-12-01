import { UpdateCursor } from "src/app/editor/entities/cursors/cursor";
import { NoteUserCursorWS } from "src/app/editor/entities/ws/note-user-cursor";


export class UpdateCursorAction {
  static type = '[Editor] update cursor';

  constructor(public noteId: string, public cursor: UpdateCursor) {}
}

export class ClearCursorsAction {
  static type = '[Editor] clear cursors';
}

export class UpdateCursorWS {
  static type = '[Editor] update cursor ws';

  constructor(public cursor: NoteUserCursorWS) {}
}
