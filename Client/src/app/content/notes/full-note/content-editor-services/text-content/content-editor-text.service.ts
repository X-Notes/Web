import { Injectable } from '@angular/core';
import { BaseText } from '../../../models/editor-models/base-text';
import { NoteTextTypeENUM } from '../../../models/editor-models/text-models/note-text-type.enum';
import { TransformContent } from '../../models/transform-content.model';
import { ContentEditorContentsSynchronizeService } from '../content-editor-contents.service';

@Injectable()
export class ContentEditorTextService {
  // TODO
  // 2. interfaces for file components

  constructor(private contentsService: ContentEditorContentsSynchronizeService) {}

  insertNewContent(contentId: string, nextRowType: NoteTextTypeENUM, isFocusToNext: boolean) {
    let index = this.contentsService.getIndexByContentId(contentId);
    if (isFocusToNext) {
      index += 1;
    }
    const nContent = BaseText.getNew();
    nContent.updateNoteTextTypeId(nextRowType);
    this.contentsService.insertInto(nContent, index);
    return { index, content: nContent };
  }

  tranformTextContentTo(value: TransformContent) {
    const item = this.contentsService.getContentAndIndexById<BaseText>(value.id);
    item.content.updateNoteTextTypeId(value.textType);
    if (value.headingType) {
      item.content.updateHeadingTypeId(value.headingType);
    }
    return item.index;
  }

  getNewTextContent = (): BaseText => {
    const nContent = BaseText.getNew();
    nContent.updateNoteTextTypeId(NoteTextTypeENUM.Default);
    return nContent;
  };

  appendNewEmptyContentToEnd(): void {
    this.contentsService.insertToEnd(this.getNewTextContent());
  }

  appendNewEmptyContentToStart() {
    this.contentsService.insertToStart(this.getNewTextContent());
  }
}
