import { Injectable } from '@angular/core';
import { BaseText } from '../../../models/editor-models/base-text';
import { ProjectBlock } from '../../content-editor/text/entities/blocks/projection-block';
import { NoteTextTypeENUM } from '../../content-editor/text/note-text-type.enum';
import { TransformContent } from '../../models/transform-content.model';
import { ContentEditorContentsService } from '../core/content-editor-contents.service';

@Injectable()
export class ContentEditorTextService {
  // TODO
  // 2. interfaces for file components

  constructor(private contentsService: ContentEditorContentsService) {}

  insertNewContent(
    contentId: string,
    nextRowType: NoteTextTypeENUM,
    insertAfter: boolean,
    textBlocks?: ProjectBlock[],
    heading?: number,
  ) {
    let index = this.contentsService.getIndexByContentId(contentId);
    if (insertAfter) {
      index += 1;
    }
    const nContent = BaseText.getNew();
    nContent.updateNoteTextTypeId(nextRowType);
    if (textBlocks?.length > 0) {
      nContent.updateContent(textBlocks);
    }
    if (heading) {
      nContent.updateHeadingTypeId(heading);
    }
    this.contentsService.insertInto(nContent, index);
    return { index, content: nContent };
  }

  transformTextContentTo(value: TransformContent) {
    const item = this.contentsService.getContentAndIndexById<BaseText>(value.id);
    item.content.updateNoteTextTypeId(value.textType);
    if (value.headingType) {
      item.content.updateHeadingTypeId(value.headingType);
    }
    return item.index;
  }

  getNewTextContent = (): BaseText => {
    const nContent = BaseText.getNew();
    nContent.updateNoteTextTypeId(NoteTextTypeENUM.default);
    return nContent;
  };

  appendNewEmptyContentToEnd(): void {
    this.contentsService.insertToEnd(this.getNewTextContent());
  }

  appendNewEmptyContentToStart() {
    this.contentsService.insertToStart(this.getNewTextContent());
  }
}
