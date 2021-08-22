import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { environment } from 'src/environments/environment';
import { HeadingTypeENUM, NoteTextTypeENUM } from '../../models/content-model.model';

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

  updateTextType(
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
