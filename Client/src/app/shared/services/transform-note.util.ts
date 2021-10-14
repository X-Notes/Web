import {
  PhotosCollection,
  ContentModel,
  ContentTypeENUM,
  VideosCollection,
  AudiosCollection,
  DocumentsCollection,
  BaseText,
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
      if (z.typeId === ContentTypeENUM.Photos) {
        return new PhotosCollection(z);
      }
      if (z.typeId === ContentTypeENUM.Videos) {
        return new VideosCollection(z);
      }
      if (z.typeId === ContentTypeENUM.Audios) {
        return new AudiosCollection(z);
      }
      if (z.typeId === ContentTypeENUM.Documents) {
        return new DocumentsCollection(z);
      }
      if (z.typeId === ContentTypeENUM.Text) {
        return new BaseText(z);
      }
      return z;
    });
  }
}
