import { AudiosCollection } from 'src/app/content/notes/models/editor-models/audios-collection';
import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { ContentModelBase } from 'src/app/content/notes/models/editor-models/content-model-base';
import { ContentTypeENUM } from 'src/app/content/notes/models/editor-models/content-types.enum';
import { DocumentsCollection } from 'src/app/content/notes/models/editor-models/documents-collection';
import { PhotosCollection } from 'src/app/content/notes/models/editor-models/photos-collection';
import { VideosCollection } from 'src/app/content/notes/models/editor-models/videos-collection';
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
  public static transformContent(contents: ContentModelBase[]) {
    return contents.map((z) => {
      if (z.typeId === ContentTypeENUM.Photos) {
        return new PhotosCollection(z as PhotosCollection);
      }
      if (z.typeId === ContentTypeENUM.Videos) {
        return new VideosCollection(z as VideosCollection);
      }
      if (z.typeId === ContentTypeENUM.Audios) {
        return new AudiosCollection(z as AudiosCollection);
      }
      if (z.typeId === ContentTypeENUM.Documents) {
        return new DocumentsCollection(z as DocumentsCollection);
      }
      if (z.typeId === ContentTypeENUM.Text) {
        return new BaseText(z as BaseText);
      }
      return z;
    });
  }
}
