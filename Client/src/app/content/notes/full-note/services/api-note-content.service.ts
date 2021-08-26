import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { BaseText, NoteTextTypeENUM } from '../../models/content-model.model';

@Injectable({
  providedIn: 'root'
})
export class ApiNoteContentService {

  constructor(private httpClient: HttpClient) { }

  newLine(noteId: string) {
    const obj = {
      noteId,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/note/inner/contents/new`,
      obj,
    );
  }

  insertLine(
    noteId: string,
    contentId: string,
    noteTextType: NoteTextTypeENUM,
    lineBreakType: string,
    nextText?: string,
  ) {
    const obj = {
      noteId,
      contentId,
      lineBreakType,
      nextText,
      noteTextType,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/note/inner/contents/insert`,
      obj,
    );
  }
  

  removeContent(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/contents/remove`,
      obj,
    );
  }

  concatRowWithPrevRow(noteId: string, contentId: string) {
    const obj = {
      contentId,
      noteId,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/note/inner/contents/concat`,
      obj,
    );
  }

}
