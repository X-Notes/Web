import { Store } from '@ngxs/store';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import {
  FileProcessTracker,
  SnackBarFileProcessHandlerService,
} from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentEditorContentsSynchronizeService } from '../content-editor-contents.service';

export class ContentEditorFilesBase {
  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
    protected uploadFilesService: UploadFilesService,
    protected longTermOperationsHandler: LongTermOperationsHandlerService,
    protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    protected contentsService: ContentEditorContentsSynchronizeService,
  ) {}

  deleteContentHandler = (contentId: string) => {
    this.deleteHandler(contentId);
  };

  insertNewCollection<T extends BaseFile>(
    contentId: string,
    isFocusToNext: boolean,
    content: BaseCollection<T>,
  ) {
    let index = this.contentsService.getIndexOrErrorById(contentId);
    if (isFocusToNext) {
      index += 1;
    }
    this.contentsService.insertInto(content, index);
    return { index, content };
  }

  protected transformContentToOrWarning<T extends ContentModelBase>(
    result: OperationResult<T>,
    contentId: string,
  ): void {
    if (result.success) {
      this.contentsService.setSafeContentsAndSyncContents(result.data, contentId);
    } else {
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      this.snackBarStatusTranslateService.validateStatus(
        lname,
        result,
        byteToMB(maxRequestFileSize),
      );
    }
  }

  protected afterUploadFilesToCollection<T>(results: FileProcessTracker<OperationResult<T[]>>[]) {
    const unsuccess = results.map((x) => x.eventBody).filter((x) => !x.success);
    if (unsuccess?.length > 0) {
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      unsuccess.forEach((op) => {
        this.snackBarStatusTranslateService.validateStatus(lname, op, byteToMB(maxRequestFileSize));
      });
    }
  }

  protected deleteHandler(contentId: string) {
    this.contentsService.deleteById(contentId, false);
  }
}
