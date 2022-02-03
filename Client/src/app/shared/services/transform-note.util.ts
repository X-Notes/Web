import { ApiAudiosCollection, AudiosCollection } from 'src/app/content/notes/models/editor-models/audios-collection';
import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { ContentModelBase } from 'src/app/content/notes/models/editor-models/content-model-base';
import { ContentTypeENUM } from 'src/app/content/notes/models/editor-models/content-types.enum';
import { ApiDocumentsCollection, DocumentsCollection } from 'src/app/content/notes/models/editor-models/documents-collection';
import { ApiPhotosCollection, PhotosCollection } from 'src/app/content/notes/models/editor-models/photos-collection';
import { ApiVideosCollection, VideosCollection } from 'src/app/content/notes/models/editor-models/videos-collection';
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
        const collection  = z as ApiPhotosCollection;
        return new PhotosCollection(collection, collection.photos);
      }
      if (z.typeId === ContentTypeENUM.Videos) {
        const collection  = z as ApiVideosCollection;
        return new VideosCollection(collection, collection.videos);
      }
      if (z.typeId === ContentTypeENUM.Audios) {
        const collection  = z as ApiAudiosCollection;
        return new AudiosCollection(collection, collection.audios);
      }
      if (z.typeId === ContentTypeENUM.Documents) {
        const collection  = z as ApiDocumentsCollection;
        return new DocumentsCollection(collection, collection.documents);
      }
      if (z.typeId === ContentTypeENUM.Text) {
        return new BaseText(z as BaseText);
      }
      return z;
    });
  }
}
