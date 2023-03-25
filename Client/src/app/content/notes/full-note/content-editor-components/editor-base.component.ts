import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { BaseText } from '../../models/editor-models/base-text';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export class EditorBaseComponent {
  @Input() noteId?: string;

  @Input()
  isReadOnlyMode = true;

  elements: QueryList<ParentInteraction>;

  constructor(public facade: EditorFacadeService) {}

  @ViewChildren('htmlComp') set elementsSet(elms: QueryList<ParentInteraction>) {
    this.elements = elms;
    this.facade.contentUpdateWsService.elements = elms;
  }

  postAction(): void {
    if (this.isReadOnlyMode || !this.elements) {
      return;
    }
    const empty = this.elements.toArray()?.length === 0;
    const isCanAppend = empty || this.isCanAddNewItem(this.elements?.last);
    if (isCanAppend) {
      this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.facade.contentEditorSyncService.change();
    this.facade.contentEditorRestoreService.save();
  }

  isCanAddNewItem(el: ParentInteraction) {
    const content = el.getContent();
    if (!content) return true;
    if (content.typeId !== ContentTypeENUM.Text) {
      return true;
    }
    const text = content as BaseText;
    if (text.noteTextTypeId !== NoteTextTypeENUM.default) {
      return true;
    }
    const uiText = el.getText();
    if (uiText && uiText?.length !== 0) {
      return true;
    }
    return false;
  }
}
