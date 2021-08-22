import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { BaseText, HeadingTypeENUM, NoteTextTypeENUM } from '../../models/content-model.model';

@Injectable()
export class ApiTextService {

  constructor(private httpClient: HttpClient) { }

  updateTitle(title: string, id: string) {
    const obj = {
      title,
      id,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/title`,
      obj,
    );
  }

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

  updateContentText(
    noteId: string,
    contentId: string,
    content: string,
    checked: boolean,
    isBold: boolean,
    isItalic: boolean,
  ) {
    const obj = {
      contentId,
      content,
      noteId,
      checked,
      isBold,
      isItalic,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/text`,
      obj,
    );
  }

  concatWithPrevious(noteId: string, contentId: string) {
    const obj = {
      contentId,
      noteId,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/note/inner/contents/concat`,
      obj,
    );
  }

  updateContentType(
    noteId: string,
    contentId: string,
    type: NoteTextTypeENUM,
    headingType: HeadingTypeENUM,
  ) {
    const obj = {
      contentId,
      type,
      noteId,
      headingType,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/inner/text/type`,
      obj,
    );
  }
}
