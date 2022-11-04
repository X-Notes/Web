import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Diff } from 'diff-match-patch';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { TextDiff } from '../content-editor-services/models/text-diff';

@Injectable()
export class ApiTextService {
  constructor(private httpClient: HttpClient) {}

  updateTitle(diffs: Diff[], title: string, id: string) {
    const obj = {
      diffs,
      title,
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
