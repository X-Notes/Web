import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { TextDiff } from '../content-editor-services/models/text-diff';
import { MergeTransaction } from '../content-editor/text/rga/types';

@Injectable()
export class ApiTextService {
  constructor(private httpClient: HttpClient) {}

  updateTitle(transactions: MergeTransaction<string>[], id: string) {
    const obj = {
      transactions,
      id,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/text/title`,
      obj,
    );
  }

  syncContents(noteId: string, updates: TextDiff[]) {
    const obj = {
      noteId,
      updates,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/text/sync`,
      obj,
    );
  }
}
