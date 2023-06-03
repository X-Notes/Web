import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { ApiAudiosCollection, AudiosCollection } from 'src/app/editor/entities/contents/audios-collection';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { ContentTypeENUM } from 'src/app/editor/entities/contents/content-types.enum';
import { ApiDocumentsCollection, DocumentsCollection } from 'src/app/editor/entities/contents/documents-collection';
import { ApiPhotosCollection, PhotosCollection } from 'src/app/editor/entities/contents/photos-collection';
import { ApiVideosCollection, VideosCollection } from 'src/app/editor/entities/contents/videos-collection';

export class TransformNoteUtil {
  // eslint-disable-next-line class-methods-use-this
  public static transformNotes<T extends SmallNote>(notes: T[]) {
    if(!notes) return [];
    return notes.map((note) => {
      // eslint-disable-next-line no-param-reassign
      note.contents = this.transformContent(note.contents);
      return note;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public static transformContent(contents: ContentModelBase[]) {
    if (!contents) return [];
    return contents.map((q) => {
      if (q.typeId === ContentTypeENUM.Photos) {
        const collection = q as ApiPhotosCollection;
        return new PhotosCollection(collection, collection.photos);
      }
      if (q.typeId === ContentTypeENUM.Videos) {
        const collection = q as ApiVideosCollection;
        return new VideosCollection(collection, collection.videos);
      }
      if (q.typeId === ContentTypeENUM.Audios) {
        const collection = q as ApiAudiosCollection;
        return new AudiosCollection(collection, collection.audios);
      }
      if (q.typeId === ContentTypeENUM.Documents) {
        const collection = q as ApiDocumentsCollection;
        return new DocumentsCollection(collection, collection.documents);
      }
      if (q.typeId === ContentTypeENUM.Text) {
        return new BaseText(q as BaseText);
      }
    });
  }
}
