import { AudiosCollection } from 'src/app/editor/entities/contents/audios-collection';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { DocumentsCollection } from 'src/app/editor/entities/contents/documents-collection';
import { PhotosCollection } from 'src/app/editor/entities/contents/photos-collection';
import { VideosCollection } from 'src/app/editor/entities/contents/videos-collection';
import { UpdateContentPosition } from './update-content-position-ws';

export class UpdateEditorStructureWS {
  contentIdsToDelete?: string[];

  textContentsToAdd?: BaseText[];

  photoContentsToAdd?: PhotosCollection[];

  videoContentsToAdd?: VideosCollection[];

  audioContentsToAdd?: AudiosCollection[];

  documentContentsToAdd?: DocumentsCollection[];

  positions?: UpdateContentPosition[];

  constructor(data: Partial<UpdateEditorStructureWS>) {
    this.contentIdsToDelete = data.contentIdsToDelete;
    this.positions = data.positions;
    this.mapCollections(data);
  }

  private mapCollections(data: Partial<UpdateEditorStructureWS>) {
    if (data.textContentsToAdd && data.textContentsToAdd.length > 0) {
      this.textContentsToAdd = data.textContentsToAdd.map((q) => new BaseText(q));
    }
    if (data.photoContentsToAdd && data.photoContentsToAdd.length > 0) {
      this.photoContentsToAdd = data.photoContentsToAdd.map(
        (q) => new PhotosCollection(q, []),
      );
    }
    if (data.videoContentsToAdd && data.videoContentsToAdd.length > 0) {
      this.videoContentsToAdd = data.videoContentsToAdd.map(
        (q) => new VideosCollection(q, []),
      );
    }
    if (data.audioContentsToAdd && data.audioContentsToAdd.length > 0) {
      this.audioContentsToAdd = data.audioContentsToAdd.map(
        (q) => new AudiosCollection(q, []),
      );
    }
    if (data.documentContentsToAdd && data.documentContentsToAdd.length > 0) {
      this.documentContentsToAdd = data.documentContentsToAdd.map(
        (q) => new DocumentsCollection(q, []),
      );
    }
  }
}
