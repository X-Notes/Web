import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { finalize, takeUntil } from 'rxjs/operators';
import { User } from './models/user/user.model';
import { ShortUser } from './models/user/short-user.model';
import { AnswerChangePhoto } from './models/answer-change-photo.model';
import { UserUsedDiskSpace } from './models/search/user-disk-space';
import { ThemeENUM } from '../shared/enums/theme.enum';
import { EntitiesSizeENUM } from '../shared/enums/font-size.enum';
import { LanguagesENUM } from '../shared/enums/languages.enum';
import { OperationResult } from '../shared/models/operation-result.model';
import { LongTermOperationsHandlerService } from '../content/long-term-operations-handler/services/long-term-operations-handler.service';
import { SnackBarFileProcessHandlerService } from '../shared/services/snackbar/snack-bar-file-process-handler.service';
import {
  LongTermOperation,
  OperationDetailMini,
} from '../content/long-term-operations-handler/models/long-term-operation';


@Injectable()
export class UserAPIService {
  constructor(
    private httpClient: HttpClient,
    protected longTermOperationsHandler: LongTermOperationsHandlerService,
    protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
  ) { }

  logout() {
    return this.httpClient.post<OperationResult<void>>(`${environment.writeAPI}/api/auth/logout`, null);
  }

  refreshToken() {
    return this.httpClient.post<OperationResult<boolean>>(`${environment.writeAPI}/api/auth/refresh`, null);
  }

  googleLogin(token: string) {
    const value = {
      token,
      languageId: LanguagesENUM.en
    };
    return this.httpClient.post<OperationResult<void>>(
      `${environment.writeAPI}/api/auth/google/login`,
      value,
    );
  }

  getUser() {
    return this.httpClient.get<OperationResult<ShortUser>>(
      `${environment.writeAPI}/api/user/short`,
    );
  }

  getMemory() {
    return this.httpClient.get<UserUsedDiskSpace>(`${environment.writeAPI}/api/user/memory`);
  }

  changeTheme(id: ThemeENUM) {
    const obj = {
      id,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/user/theme`, obj);
  }

  ping(connectionId: string) {
    const obj = {
      connectionId,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/WSManagement/ping`, obj);
  }

  changeFontSize(id: EntitiesSizeENUM) {
    const obj = {
      id,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/user/font`, obj);
  }

  changeLanguage(id: LanguagesENUM) {
    const obj = {
      id,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/user/language`, obj);
  }

  updateUserInfo(name: string) {
    const obj = {
      name,
    };
    return this.httpClient.put(`${environment.writeAPI}/api/user/info`, obj);
  }

  updateUserPhoto(photo: FormData, mini: OperationDetailMini, operation: LongTermOperation) {
    return this.httpClient
      .post<OperationResult<AnswerChangePhoto>>(`${environment.writeAPI}/api/user/photo`, photo, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
  }
}
