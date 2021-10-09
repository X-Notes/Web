import { Injectable } from '@angular/core';
import * as uuid from 'uuid';
import { BaseText, ContentTypeENUM, NoteTextTypeENUM } from '../../../models/content-model.model';
import { LineBreakType } from '../../models/html-models';
import { TransformContent } from '../../models/transform-content.model';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable()
export class ContentEditorTextService {
  // TODO
  // 2. interfaces for file components

  constructor(private contentsService: ContentEditorContentsService) {}

  deleteContent(contentId: string) {
    const index = this.contentsService.getIndexOrErrorById(contentId);
    this.contentsService.deleteById(contentId);
    const indexPrevRow = index - 1;
    return indexPrevRow;
  }

  concatContentWithPrevContent(contentId: string) {
    const data = this.contentsService.getContentAndIndexById<BaseText>(contentId);
    const prevIndex = data.index - 1;
    const prevContent = this.contentsService.getContentByIndex<BaseText>(prevIndex);
    prevContent.content += data.content.content;
    this.contentsService.deleteById(contentId);
    return prevIndex;
  }

  insertNewContent(
    contentId: string,
    nextRowType: NoteTextTypeENUM,
    breakLineType: LineBreakType,
    nextText: string,
  ) {
    let index = this.contentsService.getIndexOrErrorById(contentId);
    if (breakLineType === LineBreakType.NEXT) {
      index += 1;
    }
    const nContent = new BaseText(ContentTypeENUM.Text, uuid.v4(), new Date());
    nContent.noteTextTypeId = nextRowType;
    nContent.content = nextText;
    this.contentsService.insertInto(nContent, index);
    return index;
  }

  tranformTextContentTo(value: TransformContent) {
    const item = this.contentsService.getContentAndIndexById<BaseText>(value.id);
    item.content.noteTextTypeId = value.textType;
    if (value.headingType) {
      item.content.headingTypeId = value.headingType;
    }
    return item.index;
  }

  appendNewEmptyContentToEnd() {
    const nContent = new BaseText(ContentTypeENUM.Text, uuid.v4(), new Date());
    nContent.noteTextTypeId = NoteTextTypeENUM.Default;
    this.contentsService.insertToEnd(nContent);
  }
}
