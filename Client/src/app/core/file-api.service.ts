import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OperationResult } from '../shared/models/operation-result.model';
import { FileSizeConstraints } from './models/file-size-constraints';

@Injectable()
export class FileApiService {
  constructor(private httpClient: HttpClient) {}

  getFileSizeConstraints(): Observable<FileSizeConstraints> {
    return this.httpClient.get<FileSizeConstraints>(
      `${environment.writeAPI}/api/file/upload/constraints`,
    );
  }

  getCanUserUploadFile(size: number, types: string[]): Observable<OperationResult<boolean>> {
    const obj = {
      size,
      types,
    };
    return this.httpClient.post<OperationResult<boolean>>(
      `${environment.writeAPI}/api/file/upload/canload`,
      obj,
    );
  }
}
