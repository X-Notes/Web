import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Background } from 'src/app/core/models/background.model';
import { finalize } from 'rxjs/operators';
import { OperationResult } from '../../shared/models/operation-result.model';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermOperation } from '../long-term-operations-handler/models/long-term-operation';

@Injectable()
export class BackgroundService {
  constructor(
    private httpClient: HttpClient,
    protected longTermOperationsHandler: LongTermOperationsHandlerService
  ) {}

  getBackgrounds() {
    return this.httpClient.get<Background[]>(`${environment.api}/api/backgrounds`);
  }

  newBackground(photo: FormData, operation: LongTermOperation) {
    return this.httpClient
      .post<OperationResult<Background>>(`${environment.api}/api/backgrounds/new`, photo)
      .pipe(finalize(() => this.longTermOperationsHandler.finalize(operation)));
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
