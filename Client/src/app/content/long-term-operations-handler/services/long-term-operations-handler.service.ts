import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LongTermOperation, OperationDetailMini } from '../models/long-term-operation';
import { LongTermsIcons } from '../models/long-terms.icons';

@Injectable({
  providedIn: 'root',
})
export class LongTermOperationsHandlerService {
  public operations: LongTermOperation[] = [];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    // this.test();
  }

  test() {
    const op = this.addNewUploadToNoteOperation(
      'uploader.uploadingPhotosNoteLong',
      'uploader.uploading',
      'uploader.uploadingPhotosNote',
    );
    this.getNewMini(op, LongTermsIcons.Audio, 'Audio', false, false);
    this.getNewMini(op, LongTermsIcons.Video, 'Video');
    this.getNewMini(op, LongTermsIcons.Document, 'Document');
    this.getNewMini(op, LongTermsIcons.Image, 'Image');
    this.getNewMini(op, LongTermsIcons.Export, 'Export');

    this.addNewExportOperation('uploader.exportVideos');
    this.addNewCopingOperation('uploader.copyNotes');
    this.addNewProfilePhotoChangingOperation();
    this.addNewBackgroundChangingOperation();
    // this.finalize(op, op.details[0]);
  }

  removeOperation(operation: LongTermOperation) {
    this.operations = this.operations.filter((x) => x !== operation);
  }

  removeOperationDetail = (operation: LongTermOperation, operationMini: OperationDetailMini) => {
    // eslint-disable-next-line no-param-reassign
    operation.details = operation.details.filter((x) => x !== operationMini);
  };

  finalize = (operation: LongTermOperation, operationMini: OperationDetailMini) => {
    const start = operation.startAt.getTime();
    const end = new Date().getTime();
    const diff = end - start;
    const seconds = Math.floor((diff / 1000) % 60);
    if (seconds < 2) {
      setTimeout(() => {
        this.removeOperationDetail(operation, operationMini);
        if (operation.details.length === 0) {
          this.removeOperation(operation);
        }
      }, 500);
    } else {
      this.removeOperationDetail(operation, operationMini);
      if (operation.details.length === 0) {
        this.removeOperation(operation);
      }
    }
  };

  getNewMini = (
    operation: LongTermOperation,
    icon: LongTermsIcons,
    name: string,
    isCancelable = true,
    isShowProcents = true,
    isStatic = false,
  ) => {
    const mini: OperationDetailMini = {
      icon,
      name,
      isCancelable,
      isShowProcents,
      isStatic,
      procent: 0,
      obs: new Subject<any>(),
    };
    operation.details.push(mini);
    return mini;
  };

  // UPLOAD FILES TO NOTE
  addNewUploadToNoteOperation(
    title: string,
    titleShort: string,
    titleMedium: string,
  ): LongTermOperation {
    const item: LongTermOperation = {
      titleShort,
      title,
      startAt: new Date(),
      titleMedium,
      isGeneralCancelButtonActive: true,
      isDetailViewActive: true,
      isDetailViewOpened: true,
      isHeaderSpinnerActive: false,
      details: [],
    };
    this.operations.push(item);
    return item;
  }

  // EXPORT
  addNewExportOperation(title: string): LongTermOperation {
    const operation: LongTermOperation = {
      titleShort: 'uploader.exportShort',
      title,
      startAt: new Date(),
      titleMedium: 'uploader.exportShort',
      isGeneralCancelButtonActive: true,
      isDetailViewActive: true,
      isDetailViewOpened: true,
      isHeaderSpinnerActive: false,
      details: [],
    };
    this.operations.push(operation);
    return operation;
  }

  // COPYING
  addNewCopingOperation(title: string): LongTermOperation {
    const operation: LongTermOperation = {
      titleShort: 'uploader.copyShort',
      title,
      startAt: new Date(),
      titleMedium: 'uploader.copyShort',
      isGeneralCancelButtonActive: false,
      isDetailViewActive: false,
      isDetailViewOpened: true,
      isHeaderSpinnerActive: true,
      details: [],
    };
    this.operations.push(operation);
    return operation;
  }

  addNewProfilePhotoChangingOperation(): LongTermOperation {
    const title = 'uploader.changingProfilePhoto';
    const operation: LongTermOperation = {
      titleShort: title,
      title,
      titleMedium: title,
      startAt: new Date(),
      isGeneralCancelButtonActive: false,
      isDetailViewActive: false,
      isDetailViewOpened: true,
      isHeaderSpinnerActive: true,
      details: [],
    };
    this.operations.push(operation);
    return operation;
  }

  addNewBackgroundChangingOperation(): LongTermOperation {
    const title = 'uploader.changingBackground';
    const operation: LongTermOperation = {
      titleShort: title,
      title,
      titleMedium: title,
      startAt: new Date(),
      isGeneralCancelButtonActive: false,
      isDetailViewActive: false,
      isDetailViewOpened: true,
      isHeaderSpinnerActive: true,
      details: [],
    };
    this.operations.push(operation);
    return operation;
  }
}
