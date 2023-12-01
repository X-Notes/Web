import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OperationResult } from '../../shared/models/operation-result.model';
import { ShortUserPublic } from '../interfaces/short-user-public.model';

@Injectable()
export class PublicAPIService {
  constructor(private httpClient: HttpClient) {}

  getPublicUser(id: string) {
    return this.httpClient.get<OperationResult<ShortUserPublic>>(
      `${environment.api}/api/user/short/${id}`,
    );
  }
}
