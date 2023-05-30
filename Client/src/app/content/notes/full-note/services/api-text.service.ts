import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { TextUpdateResult } from '../models/api/notes/text-update-result';
import { TextDiff } from '../models/api/editor/text-diff';

@Injectable()
export class ApiTextService {
  constructor(private httpClient: HttpClient) {}

  updateTitle(title: string, id: string) {
    const obj = {
      title,
      id,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/text/title`,
      obj,
    );
  }

  syncContents(noteId: string, texts: TextDiff[]) {
    const obj = {
      noteId,
      texts,
    };
    return this.httpClient.patch<OperationResult<TextUpdateResult[]>>(
      `${environment.writeAPI}/api/note/inner/text/sync`,
      obj,
    );
  }
}
