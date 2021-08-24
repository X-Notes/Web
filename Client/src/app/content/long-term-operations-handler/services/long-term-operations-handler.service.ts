import { Injectable } from '@angular/core';
import { LongTermOperation, OperationDetailMini } from '../models/long-term-operation';

@Injectable({
  providedIn: 'root'
})
export class LongTermOperationsHandlerService {

  public operations: LongTermOperation[] = [];

  constructor() {
  }

  removeItem(operation: LongTermOperation) {
    this.operations = this.operations.filter(x => x !== operation);
  }

  getNewUploadToNoteOperation(): LongTermOperation {
    const item: LongTermOperation = {
      title: 'Uploading files to a note',
      isDetailViewActive: true,
      isDetailViewOpened: true,
      details: []
    };
    this.operations.push(item);
    return item;
  }

  getOperationDetailMiniUploadToNoteOperation(operation: LongTermOperation) {
    const mini: OperationDetailMini = {
      icon: 'image',
      name: 'file-name',
      isCancelable: true,
      isShowProcess: true,
      procent: 0,
    }
    operation.details.push(mini);
    return mini;
  }

}
