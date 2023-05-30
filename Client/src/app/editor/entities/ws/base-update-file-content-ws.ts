import { BaseCollection } from '../contents/base-collection';
import { BaseFile } from '../contents/base-file';
import { UpdateOperationWS } from './update-operation-ws.enum';

export class BaseUpdateFileContent<T extends BaseCollection<BaseFile>> {
  contentId?: string;

  collectionItemIds?: string[];

  operation?: UpdateOperationWS;

  collection?: T;

  name?: string;

  entityTime?: Date;

  version?: number;
}
