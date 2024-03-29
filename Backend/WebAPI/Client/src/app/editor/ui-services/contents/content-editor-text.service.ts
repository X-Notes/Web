import { Injectable } from '@angular/core';
import { NoteTextTypeENUM } from '../../entities/contents/text-models/note-text-type.enum';
import { TextBlock } from '../../entities/contents/text-models/text-block';
import {
  ContentAndIndex,
  ContentEditorContentsService,
} from './content-editor-contents.service';
import { TransformContent } from '../../entities-ui/transform-content.model';
import { BaseText } from '../../entities/contents/base-text';
import { tabCount } from 'src/app/core/defaults/constraints';

@Injectable()
export class ContentEditorTextService {
  // TODO
  // 2. interfaces for file components

  constructor(private contentsService: ContentEditorContentsService) { }

  insertNewContent(
    contentId: string,
    nextRowType: NoteTextTypeENUM,
    insertAfter: boolean,
    textBlocks?: TextBlock[],
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

  transformTextContentTo(value: TransformContent): ContentAndIndex<BaseText> {
    const item = this.contentsService.getContentAndIndexById<BaseText>(value.content.getContentId());
    item.content.updateNoteTextTypeId(value.textType);
    if (value.headingType) {
      item.content.updateHeadingTypeId(value.headingType);
    }
    return item;
  }

  updateTabCount(contentId: string, addTab: boolean) {
    const item = this.contentsService.getContentAndIndexById<BaseText>(contentId);
    if (!item.content.metadata.tabCount) {
      item.content.metadata.tabCount = 0;
    }
    if (addTab) {
      if (item.content.metadata.tabCount >= tabCount) {
        item.content.metadata.tabCount = tabCount;
      } else {
        item.content.metadata.tabCount++;
      }
    }
    if (!addTab && item.content.metadata.tabCount > 0) {
      item.content.metadata.tabCount--;
    }
  }

  getNewTextContent = (): BaseText => {
    const nContent = BaseText.getNew();
    nContent.updateNoteTextTypeId(NoteTextTypeENUM.default);
    return nContent;
  };

  appendNewEmptyContentToEnd(): BaseText {
    const content = this.getNewTextContent();
    this.contentsService.insertToEnd(content);
    return content;
  }

  appendNewEmptyContentToStart() {
    const content = this.getNewTextContent();
    this.contentsService.insertToStart(content);
    return content;
  }
}
