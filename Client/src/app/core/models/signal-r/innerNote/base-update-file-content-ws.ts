import { ContentModelBase } from 'src/app/content/notes/models/editor-models/content-model-base';
import { UpdateOperationWS } from './update-operation-ws.enum';

export class BaseUpdateFileContent<T extends ContentModelBase> {
  contentId: string;

  collectionItemIds: string[];

  operation: UpdateOperationWS;

  collection: T;

  name: string;

  entityTime: Date;
}
