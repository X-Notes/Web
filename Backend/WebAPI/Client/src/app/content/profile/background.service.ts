import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Background } from 'src/app/core/models/background.model';
import { finalize, takeUntil } from 'rxjs/operators';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { OperationResult } from '../../shared/models/operation-result.model';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import {
  LongTermOperation,
  OperationDetailMini,
} from '../long-term-operations-handler/models/long-term-operation';

@Injectable()
export class BackgroundService {
  constructor(
    private httpClient: HttpClient,
    protected longTermOperationsHandler: LongTermOperationsHandlerService,
    protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
  ) {}

  getBackgrounds() {
    return this.httpClient.get<Background[]>(`${environment.api}/api/backgrounds`);
  }

  newBackground(photo: FormData, mini: OperationDetailMini, operation: LongTermOperation) {
    return this.httpClient
      .post<OperationResult<Background>>(`${environment.api}/api/backgrounds/new`, photo, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
  }

  setBackground(id: string) {
    return this.httpClient.get(`${environment.api}/api/backgrounds/background/${id}`);
  }

  removeBackground(id: string) {
    return this.httpClient.delete(`${environment.api}/api/backgrounds/background/${id}`);
  }

  defaultBackground() {
    return this.httpClient.get(`${environment.api}/api/backgrounds/background/default`);
  }
}
