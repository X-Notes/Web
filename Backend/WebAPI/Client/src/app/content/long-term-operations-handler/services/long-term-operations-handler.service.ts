import { Injectable } from '@angular/core';
import { LongTermOperation } from '../models/long-term-operation';

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
    // this.getNewMini(op, LongTermsIcons.Audio, 'Audio', false, false);
    // this.getNewMini(op, LongTermsIcons.Video, 'Video');
    // this.getNewMini(op, LongTermsIcons.Document, 'Document');
    // this.getNewMini(op, LongTermsIcons.Image, 'Image');
    // this.getNewMini(op, LongTermsIcons.Export, 'Export');

    this.addNewExportOperation('uploader.exportVideos');
    this.addNewCopingOperation('uploader.copyNotes');
    this.addNewProfilePhotoChangingOperation();
    this.addNewBackgroundChangingOperation();
    // this.finalize(op, op.details[0]);
  }

  removeOperation(operation: LongTermOperation) {
    this.operations = this.operations.filter((x) => x !== operation);
  }

  finalize = (operation: LongTermOperation) => {
    const start = operation.startAt.getTime();
    const end = new Date().getTime();
    const diff = end - start;
    const seconds = Math.floor((diff / 1000) % 60);
    if (seconds < 2) {
      setTimeout(() => {
        this.removeOperation(operation);
      }, 500);
    } else {
      this.removeOperation(operation);
    }
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
      isHeaderSpinnerActive: true
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
      isHeaderSpinnerActive: true
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
      isHeaderSpinnerActive: true
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
      isHeaderSpinnerActive: true
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
      isHeaderSpinnerActive: true
    };
    this.operations.push(operation);
    return operation;
  }
}
