import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { ShowSnackNotification } from 'src/app/core/stateApp/app-action';
import { LanguagesENUM } from '../../enums/languages.enum';
import {
  OperationResult,
  OperationResultAdditionalInfo,
} from '../../models/operation-result.model';

@Injectable()
export class SnackBarHandlerStatusService {
  constructor(private store: Store, private translateService: TranslateService) {}

  validateStatus(lname: LanguagesENUM, result: OperationResult<any>, fileSize: string) {
    if (result.status === OperationResultAdditionalInfo.NoAccessRights) {
      const message = this.translateService.instant('files.noAccessRightsNote');
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if (result.status === OperationResultAdditionalInfo.NotEnoughMemory) {
      const message = this.translateService.instant('files.noEnoughMemory');
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if (result.status === OperationResultAdditionalInfo.FileSizeTooLarge) {
      const message = this.translateService.instant('files.fileTooLarge', { sizeMB: fileSize });
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if (result.status === OperationResultAdditionalInfo.NoSupportExtension) {
      const message = this.translateService.instant('files.fileNoSupport');
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if (result.status === OperationResultAdditionalInfo.NoAnyFile) {
      return true;
    }

    return false;
  }
}
