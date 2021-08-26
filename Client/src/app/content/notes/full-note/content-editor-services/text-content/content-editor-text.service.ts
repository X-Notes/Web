import { Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../../models/content-model.model';
import { EditTextEventModel } from '../../models/edit-text-event.model';
import { LineBreakType } from '../../models/html-models';
import { TransformContent } from '../../models/transform-content.model';
import { ApiNoteContentService } from '../../services/api-note-content.service';
import { ApiTextService } from '../../services/api-text.service';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorTextService {

  // TODO
  // 2. interfaces for file components

  constructor(
    private apiNoteContent: ApiNoteContentService,
    private apiText: ApiTextService,
    private contentsService: ContentEditorContentsService,
    ) { }

    async deleteContent(contentId: string, noteId: string) {
      const resp = await this.apiNoteContent.removeContent(noteId, contentId).toPromise();
      if (resp.success) {
        const index = this.contentsService.getIndexOrErrorById(contentId);
        this.contentsService.removeById(contentId);
        const indexPrevRow = index - 1;
        return indexPrevRow;
      }
      return -1;
  }

  async concatContentWithPrevContent(contentId: string, noteId: string) {
    const resp = await this.apiNoteContent.concatRowWithPrevRow(noteId, contentId).toPromise();
    if (resp.success) {
      const index = this.contentsService.setSafe(resp.data, contentId);
      this.contentsService.removeById(contentId);
      return index;
    }
    return -1;
  }

  async insertNewContent(noteId: string, contentId: string, nextRowType: NoteTextTypeENUM, breakLineType: LineBreakType, nextText: string) {
    const resp = await this.apiNoteContent.insertLine(noteId, contentId, nextRowType, breakLineType, nextText).toPromise();
    if (resp.success) {
      let index = this.contentsService.getIndexOrErrorById(contentId);
      if (breakLineType === LineBreakType.NEXT) {
        index += 1;
      }
      this.contentsService.insertInto(resp.data, index);
      return index;
    }
    return -1;
  }

  async updateTextContent(noteId: string, e: EditTextEventModel) {
    const resp = await this.apiText.updateContentText(noteId, e.contentId, e.content, e.checked, e.isBold, e.isItalic).toPromise();
    return resp.success;
  }

  async tranformTextContentTo(noteId: string, value: TransformContent) {
    const resp = await this.apiText.updateTextType(noteId, value.id, value.textType, value.headingType).toPromise();
    if(resp.success){
      const item = this.contentsService.getContentAndIndexById<BaseText>(value.id);
      item.content.noteTextTypeId = value.textType;
      if (value.headingType) {
        item.content.headingTypeId = value.headingType;
      }
      return item.index;
    }
    return -1;
  }

  async appendNewEmptyContentToEnd(noteId: string){
    const resp = await this.apiNoteContent.newLine(noteId).toPromise();
    if (resp.success) {
      this.contentsService.insertToEnd(resp.data);
    }
  }

}
