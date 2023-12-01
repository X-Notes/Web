import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';

export interface UpdateRelatedNotesWS {
  noteId: string;
  idsToAdd: string[];
  idsToRemove: string[];
  positions: PositionEntityModel[];
}
