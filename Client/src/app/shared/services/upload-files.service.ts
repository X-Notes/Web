import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { fileSizeForCheck, maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { FileApiService } from 'src/app/core/file-api.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SnackBarHandlerStatusService } from './snackbar/snack-bar-handler-status.service';

@Injectable({
  providedIn: 'root',
})
export class UploadFilesService {
  constructor(
    private snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private fileApiService: FileApiService,
    private store: Store,
  ) {}

  async isCanUserUploadFiles(files: File[]): Promise<boolean> {
    const size = files.map((x) => x.size).reduce((pv, cv) => cv + pv);
    if (size > fileSizeForCheck) {
      const opResult = await this.fileApiService
        .getCanUserUploadFile(
          size,
          files.map((x) => x.type),
        )
        .toPromise();
      if (!opResult.success) {
        const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
        this.snackBarStatusTranslateService.validateStatus(
          lname,
          opResult,
          byteToMB(maxRequestFileSize),
        );
        return false;
      }
    }
    return true;
  }
}
