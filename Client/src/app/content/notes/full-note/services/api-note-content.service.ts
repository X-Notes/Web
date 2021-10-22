import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { StructureDiffs } from '../content-editor-services/models/structure-diffs';

@Injectable({
  providedIn: 'root',
})
export class ApiNoteContentService {
  constructor(private httpClient: HttpClient) {}

  syncContentsStructure(noteId: string, diffs: StructureDiffs) {
    const obj = {
      diffs,
      noteId,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/contents/sync/structure`,
      obj,
    );
  }
}
