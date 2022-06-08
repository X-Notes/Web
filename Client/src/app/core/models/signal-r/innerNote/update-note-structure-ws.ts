import { AudiosCollection } from 'src/app/content/notes/models/editor-models/audios-collection';
import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { ContentModelBase } from 'src/app/content/notes/models/editor-models/content-model-base';
import { DocumentsCollection } from 'src/app/content/notes/models/editor-models/documents-collection';
import { PhotosCollection } from 'src/app/content/notes/models/editor-models/photos-collection';
import { VideosCollection } from 'src/app/content/notes/models/editor-models/videos-collection';
import { UpdateContentPosition } from './update-content-position-ws';

export class UpdateNoteStructureWS {
  contentIdsToDelete: string[];

  textContentsToAdd: BaseText[];

  photoContentsToAdd: ContentModelBase[];

  videoContentsToAdd: ContentModelBase[];

  audioContentsToAdd: ContentModelBase[];

  documentContentsToAdd: ContentModelBase[];

  positions: UpdateContentPosition[];

  constructor(data: Partial<UpdateNoteStructureWS>) {
    this.contentIdsToDelete = data.contentIdsToDelete;
    this.positions = data.positions;
    this.mapCollections(data);
  }

  private mapCollections(data: Partial<UpdateNoteStructureWS>) {
    if (data.textContentsToAdd && data.textContentsToAdd.length > 0) {
      this.textContentsToAdd = data.textContentsToAdd.map((q) => new BaseText(q));
    }
    if (data.photoContentsToAdd && data.photoContentsToAdd.length > 0) {
      this.photoContentsToAdd = data.photoContentsToAdd.map(
        (q) => new PhotosCollection(q as PhotosCollection, []),
      );
    }
    if (data.videoContentsToAdd && data.videoContentsToAdd.length > 0) {
      this.videoContentsToAdd = data.videoContentsToAdd.map(
        (q) => new VideosCollection(q as VideosCollection, []),
      );
    }
    if (data.audioContentsToAdd && data.audioContentsToAdd.length > 0) {
      this.audioContentsToAdd = data.audioContentsToAdd.map(
        (q) => new AudiosCollection(q as AudiosCollection, []),
      );
    }
    if (data.documentContentsToAdd && data.documentContentsToAdd.length > 0) {
      this.documentContentsToAdd = data.documentContentsToAdd.map(
        (q) => new DocumentsCollection(q as DocumentsCollection, []),
      );
    }
  }
}
