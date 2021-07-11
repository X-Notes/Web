import {
  Album,
  ContentModel,
  ContentTypeENUM,
} from 'src/app/content/notes/models/content-model.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';

export class TransformNoteUtil {
  // eslint-disable-next-line class-methods-use-this
  public static transformNotes<T extends SmallNote>(notes: T[]) {
    return notes.map((note) => {
      // eslint-disable-next-line no-param-reassign
      note.contents = this.transformContent(note.contents);
      return note;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public static transformContent(contents: ContentModel[]) {
    return contents.map((z) => {
      if (z.typeId === ContentTypeENUM.NoteAlbum) {
        return new Album(z);
      }
      return z;
    });
  }
}
