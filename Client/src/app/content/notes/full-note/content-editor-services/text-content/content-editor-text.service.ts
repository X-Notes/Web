import { Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../../models/content-model.model';
import { TransformContent } from '../../models/transform-content.model';
import { ContentEditorContentsService } from '../content-editor-contents.service';

@Injectable()
export class ContentEditorTextService {
  // TODO
  // 2. interfaces for file components

  constructor(
    private contentsService: ContentEditorContentsService) {}

  deleteContent(contentId: string) {
    const index = this.contentsService.getIndexOrErrorById(contentId);
    if(index !== 0){
      this.contentsService.deleteById(contentId);
      return index - 1;
    }
    return 0;
  }

  concatContentWithPrevContent(contentId: string) {
    const data = this.contentsService.getContentAndIndexById<BaseText>(contentId);
    const prevIndex = data.index - 1;
    const prevContent = this.contentsService.getContentByIndex<BaseText>(prevIndex);
    const resContent = prevContent.contentSG + data.content.contentSG;
    prevContent.contentSG = resContent;
    this.contentsService.deleteById(contentId);
    return prevIndex;
  }

  insertNewContent(
    contentId: string,
    nextRowType: NoteTextTypeENUM,
    isFocusToNext: boolean,
    nextText: string,
  ) {
    let index = this.contentsService.getIndexOrErrorById(contentId);
    if (isFocusToNext) {
      index += 1;
    }

    const nContent = BaseText.getNew();
    nContent.noteTextTypeIdSG = nextRowType;
    nContent.contentSG = nextText;
    this.contentsService.insertInto(nContent, index);
    return index;
  }

  tranformTextContentTo(value: TransformContent) {
    const item = this.contentsService.getContentAndIndexById<BaseText>(value.id);
    item.content.noteTextTypeIdSG = value.textType;
    if (value.headingType) {
      item.content.headingTypeIdSG = value.headingType;
    }
    return item.index;
  }

  getNewTextContent(): BaseText{
    const nContent = BaseText.getNew();
    nContent.noteTextTypeIdSG = NoteTextTypeENUM.Default;
    return nContent;
  }


  appendNewEmptyContentToEnd() {
    this.contentsService.insertToEnd(this.getNewTextContent());
  }

  appendNewEmptyContentToStart() {
    this.contentsService.insertToStart(this.getNewTextContent());
  }
}
