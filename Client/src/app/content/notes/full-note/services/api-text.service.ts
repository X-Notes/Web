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
      `${environment.writeAPI}/api/fullnote/title`,
      obj,
    );
  }

  newLine(noteId: string) {
    const obj = {
      noteId,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/new`,
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
      `${environment.writeAPI}/api/fullnote/content/insert`,
      obj,
    );
  }

  removeContent(noteId: string, contentId: string) {
    const obj = {
      noteId,
      contentId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/fullnote/content/remove`,
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
      `${environment.writeAPI}/api/fullnote/text`,
      obj,
    );
  }

  concatWithPrevious(noteId: string, contentId: string) {
    const obj = {
      contentId,
      noteId,
    };
    return this.httpClient.post<OperationResult<BaseText>>(
      `${environment.writeAPI}/api/fullnote/content/concat`,
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
      `${environment.writeAPI}/api/fullnote/text/type`,
      obj,
    );
  }
}
