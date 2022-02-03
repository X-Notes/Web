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
        const collection  = z as PhotosCollection;
        return new PhotosCollection(collection, collection.items);
      }
      if (z.typeId === ContentTypeENUM.Videos) {
        const collection  = z as VideosCollection;
        return new VideosCollection(collection, collection.items);
      }
      if (z.typeId === ContentTypeENUM.Audios) {
        const collection  = z as AudiosCollection;
        return new AudiosCollection(collection, collection.items);
      }
      if (z.typeId === ContentTypeENUM.Documents) {
        const collection  = z as DocumentsCollection;
        return new DocumentsCollection(collection, collection.items);
      }
      if (z.typeId === ContentTypeENUM.Text) {
        return new BaseText(z as BaseText);
      }
      return z;
    });
  }
}
