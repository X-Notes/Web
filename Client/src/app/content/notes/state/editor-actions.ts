import { NoteUserCursorWS } from 'src/app/core/models/signal-r/innerNote/note-user-cursor';
import { UpdateCursor } from '../full-note/models/cursors/cursor';

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
