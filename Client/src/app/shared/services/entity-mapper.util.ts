import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { TreeBlock } from 'src/app/content/notes/full-note/content-editor/text/entities/blocks/tree-block';
import { TreeRGA } from 'src/app/content/notes/full-note/content-editor/text/rga/tree-rga';
import {
  ApiAudiosCollection,
  AudiosCollection,
} from 'src/app/content/notes/models/editor-models/audios-collection';
import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { ContentModelBase } from 'src/app/content/notes/models/editor-models/content-model-base';
import { ContentTypeENUM } from 'src/app/content/notes/models/editor-models/content-types.enum';
import {
  ApiDocumentsCollection,
  DocumentsCollection,
} from 'src/app/content/notes/models/editor-models/documents-collection';
import {
  ApiPhotosCollection,
  PhotosCollection,
} from 'src/app/content/notes/models/editor-models/photos-collection';
import {
  ApiVideosCollection,
  VideosCollection,
} from 'src/app/content/notes/models/editor-models/videos-collection';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';

export class EntityMapperUtil {
  // eslint-disable-next-line class-methods-use-this
  public static transformNotes<T extends SmallNote>(notes: T[]) {
    return notes.map((note) => {
      // eslint-disable-next-line no-param-reassign
      note.contents = this.transformContent(note.contents);
      note.title = this.transformTreeRga(note.title);
      return note;
    });
  }

  public static transformFolders<T extends SmallFolder>(folders: T[]) {
    return folders.map((folder) => {
      // eslint-disable-next-line no-param-reassign
      folder.title = this.transformTreeRga(folder.title);
      return folder;
    });
  }

  public static transformTreeRga(obj: TreeRGA<string>): TreeRGA<string> {
    if (obj) {
      return TreeRGA.initFrom(obj);
    }
    return new TreeRGA<string>();
  }

  public static transformBlockTreeRga(obj: TreeBlock): TreeBlock {
    return TreeBlock.initFrom(obj);
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
        const text = new BaseText(q as BaseText);
        text.contents = text.contents?.map((x) => this.transformBlockTreeRga(x));
        return text;
      }
    });
  }
}
