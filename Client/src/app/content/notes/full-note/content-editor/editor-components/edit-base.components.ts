import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { NoteTextTypeENUM } from '../text/note-text-type.enum';
import { EditorFacadeService as EditorFacadeService } from '../services/editor-api-facade.service';

@Component({
  selector: '',
  template: '',
})
export class EditorBaseComponent {
    @Input() noteId?: string;

    @Input() snapshotId?: string;

    @Input() folderId?: string;

    @Input()
    isReadOnlyMode = true;

    elements: QueryList<ParentInteraction>;

    @ViewChildren('htmlComp') set elementsSet(elms: QueryList<ParentInteraction>) {
      this.elements = elms;
      this.facade.contentUpdateWsService.elements = elms;
    }

    postAction(): void {
      if (this.isReadOnlyMode) {
        return;
      }
      const isCanAppend = this.isCanAddNewItem(this.elements?.last?.getContent());
      if (isCanAppend) {
        this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
      }
      this.facade.contentEditorSyncService.change();
      this.facade.contentEditorRestoreService.save();
    }

    isCanAddNewItem(content: ContentModelBase) {
      if (!content) return true;
      if (content.typeId !== ContentTypeENUM.Text) {
        return true;
      }
      const text = content as BaseText;
      if (text.noteTextTypeId !== NoteTextTypeENUM.default) {
        return true;
      }
      if (text.contentsUI && text.contentsUI?.length !== 0) {
        return true;
      }
      return false;
    }

    constructor(public facade: EditorFacadeService) {}
}
