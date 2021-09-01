import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LongTermOperation, OperationDetailMini } from '../models/long-term-operation';
import { LongTermsIcons } from '../models/long-terms.icons';

@Injectable({
  providedIn: 'root',
})
export class LongTermOperationsHandlerService {
  public operations: LongTermOperation[] = [];

  constructor() {
    const s = async () =>
      this.addNewUploadToNoteOperation(
        'uploader.uploadingPhotosNoteLong',
        'uploader.uploading',
        'uploader.uploadingPhotosNote',
      );
    s().then((op) =>
      this.addOperationDetailMiniUploadToNoteOperation(
        op,
        new Subject<any>(),
        LongTermsIcons.Audio,
        'KEK',
      ),
    );
    this.addNewExportOperation('uploader.exportVideos', new Subject<any>());
    this.addNewCopingOperation('uploader.exportVideos', new Subject<any>());
    this.addNewProfilePhotoChangingOperation(new Subject<any>());
  }

  removeOperation(operation: LongTermOperation) {
    this.operations = this.operations.filter((x) => x !== operation);
  }

  removeOperationDetail = (operation: LongTermOperation, operationMini: OperationDetailMini) => {
    // eslint-disable-next-line no-param-reassign
    operation.details = operation.details.filter((x) => x !== operationMini);
  };

  finalize = (operation: LongTermOperation, operationMini: OperationDetailMini) => {
    this.removeOperationDetail(operation, operationMini);
    if (operation.details.length === 0) {
      this.removeOperation(operation);
    }
  };

  async addNewUploadToNoteOperation(
    title: string,
    titleShort: string,
    titleMedium: string,
  ): Promise<LongTermOperation> {
    const item: LongTermOperation = {
      titleShort,
      title,
      titleMedium,
      isGeneralCancelButtonActive: true,
      isDetailViewActive: true,
      isDetailViewOpened: true,
      details: [],
    };
    this.operations.push(item);
    return item;
  }

  addOperationDetailMiniUploadToNoteOperation = (
    operation: LongTermOperation,
    cancellationToken: Subject<any>,
    icon: LongTermsIcons,
    name: string,
  ) => {
    const mini: OperationDetailMini = {
      icon,
      name,
      isCancelable: true,
      isShowProcess: true,
      procent: 0,
      obs: cancellationToken,
    };
    operation.details.push(mini);
    return mini;
  };

  async addNewExportOperation(
    title: string,
    cancellationToken: Subject<any>,
  ): Promise<LongTermOperation> {
    const operation: LongTermOperation = {
      titleShort: 'uploader.exportShort',
      title,
      titleMedium: 'uploader.exportShort',
      isGeneralCancelButtonActive: true,
      isDetailViewActive: false,
      isDetailViewOpened: true,
      details: [],
    };
    this.operations.push(operation);
    const mini: OperationDetailMini = {
      icon: LongTermsIcons.Export,
      name: 'uploader.exportShort',
      isCancelable: true,
      isShowProcess: true,
      procent: 0,
      obs: cancellationToken,
    };
    operation.details.push(mini);
    return operation;
  }

  async addNewCopingOperation(
    title: string,
    cancellationToken: Subject<any>,
  ): Promise<LongTermOperation> {
    const operation: LongTermOperation = {
      titleShort: 'uploader.copyShort',
      title,
      titleMedium: 'uploader.copyShort',
      isGeneralCancelButtonActive: false,
      isDetailViewActive: false,
      isDetailViewOpened: true,
      details: [],
    };

    this.operations.push(operation);
    const mini: OperationDetailMini = {
      icon: LongTermsIcons.Export,
      name: 'uploader.copyShort',
      isCancelable: true,
      isShowProcess: true,
      procent: 0,
      obs: cancellationToken,
    };

    operation.details.push(mini);

    return operation;
  }

  async addNewProfilePhotoChangingOperation(
    cancellationToken: Subject<any>,
  ): Promise<LongTermOperation> {
    const title = 'uploader.changingProfilePhoto';

    const operation: LongTermOperation = {
      titleShort: title,
      title,
      titleMedium: title,
      isGeneralCancelButtonActive: false,
      isDetailViewActive: false,
      isDetailViewOpened: true,
      details: [],
    };

    this.operations.push(operation);
    const mini: OperationDetailMini = {
      icon: LongTermsIcons.Export,
      name: title,
      isCancelable: true,
      isShowProcess: true,
      procent: 0,
      obs: cancellationToken,
    };

    operation.details.push(mini);

    return operation;
  }
}
