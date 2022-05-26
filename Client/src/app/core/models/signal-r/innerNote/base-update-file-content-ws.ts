import { BaseCollection } from 'src/app/content/notes/models/editor-models/base-collection';
import { BaseFile } from 'src/app/content/notes/models/editor-models/base-file';
import { UpdateOperationWS } from './update-operation-ws.enum';

export class BaseUpdateFileContent<T extends BaseCollection<BaseFile>> {
  contentId: string;

  collectionItemIds: string[];

  operation: UpdateOperationWS;

  collection: T;

  name: string;

  entityTime: Date;
}
