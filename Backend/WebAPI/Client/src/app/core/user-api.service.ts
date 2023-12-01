import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { finalize, takeUntil } from 'rxjs/operators';
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
import { RefreshCommand } from './models/auth/refresh-command';
import { RefreshResult } from './models/auth/refresh-result';
import { LoginResult } from './models/search/login-result';


@Injectable()
export class UserAPIService {
  constructor(
    private httpClient: HttpClient,
    protected longTermOperationsHandler: LongTermOperationsHandlerService,
    protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
  ) { }

  logout(refreshToken: string) {
    return this.httpClient.post<OperationResult<void>>(`${environment.api}/api/auth/logout?refreshToken=${refreshToken}`, null);
  }

  refreshToken(command: RefreshCommand) {
    return this.httpClient.post<OperationResult<RefreshResult>>(`${environment.api}/api/auth/refresh`, command);
  }

  googleLogin(token: string) {
    const value = {
      token,
      languageId: LanguagesENUM.en
    };
    return this.httpClient.post<OperationResult<LoginResult>>(
      `${environment.api}/api/auth/google/login`,
      value,
    );
  }

  getUser() {
    return this.httpClient.get<OperationResult<ShortUser>>(
      `${environment.api}/api/user/short`,
    );
  }

  getMemory() {
    return this.httpClient.get<UserUsedDiskSpace>(`${environment.api}/api/user/memory`);
  }

  changeTheme(id: ThemeENUM) {
    const obj = {
      id,
    };
    return this.httpClient.post(`${environment.api}/api/user/theme`, obj);
  }

  ping(connectionId: string) {
    const obj = {
      connectionId,
    };
    return this.httpClient.post(`${environment.api}/api/WSManagement/ping`, obj);
  }

  changeFontSize(id: EntitiesSizeENUM) {
    const obj = {
      id,
    };
    return this.httpClient.post(`${environment.api}/api/user/font`, obj);
  }

  changeLanguage(id: LanguagesENUM) {
    const obj = {
      id,
    };
    return this.httpClient.post(`${environment.api}/api/user/language`, obj);
  }

  updateUserInfo(name: string) {
    const obj = {
      name,
    };
    return this.httpClient.put(`${environment.api}/api/user/info`, obj);
  }

  updateUserPhoto(photo: FormData, mini: OperationDetailMini, operation: LongTermOperation) {
    return this.httpClient
      .post<OperationResult<AnswerChangePhoto>>(`${environment.api}/api/user/photo`, photo, {
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
