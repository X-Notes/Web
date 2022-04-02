import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OperationResult } from '../../shared/models/operation-result.model';

@Injectable()
export class LockEncryptService {
  constructor(private httpClient: HttpClient) {}

  encryptNote(noteId: string, password: string, confirmPassword: string) {
    const obj = {
      noteId,
      password,
      confirmPassword,
    };
    return this.httpClient.post<OperationResult<boolean>>(
      `${environment.writeAPI}/api/lock/encrypt`,
      obj,
    );
  }

  decryptNote(noteId: string, password: string) {
    const obj = {
      noteId,
      password,
    };
    return this.httpClient.post<OperationResult<boolean>>(
      `${environment.writeAPI}/api/lock/decrypt`,
      obj,
    );
  }

  tryUnlockNote(noteId: string, password: string) {
    const obj = {
      noteId,
      password,
    };
    return this.httpClient.post<OperationResult<boolean>>(
      `${environment.writeAPI}/api/lock/unlock`,
      obj,
    );
  }

  forceLock(noteId: string) {
    return this.httpClient.get<OperationResult<boolean>>(
      `${environment.writeAPI}/api/lock/force/${noteId}`,
    );
  }
}
