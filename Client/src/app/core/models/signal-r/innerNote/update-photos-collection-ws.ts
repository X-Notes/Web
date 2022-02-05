import { PhotosCollection } from 'src/app/content/notes/models/editor-models/photos-collection';
import { BaseUpdateFileContent } from './base-update-file-content-ws';

export class UpdatePhotosCollectionWS extends BaseUpdateFileContent<PhotosCollection> {
  width: string;

  height: string;

  countInRow: number;
}
