import { Component, EventEmitter, Output } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { UpdateStyleMode, UpdateTextStyles } from '../../models/update-text-styles';
import { MenuSelectionService } from '../content-editor-services/menu-selection.service';
import { TransformContent } from '../models/transform-content.model';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss'],
})
export class TextEditMenuComponent {
  @Output()
  eventTransform = new EventEmitter<TransformContent>();

  @Output()
  updateText = new EventEmitter<UpdateTextStyles>();

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  constructor(
    public menuSelectionService: MenuSelectionService,
    private apiBrowserService: ApiBrowserTextService,
  ) {}

  preventUnSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  transformContent(e, type: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) return;
    if (item.noteTextTypeId === type && item.headingTypeId === heading) {
      this.eventTransform.emit({
        id: item.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      const textType = type === item.noteTextTypeId ? NoteTextTypeENUM.Default : type;
      this.eventTransform.emit({
        id: item.id,
        textType,
        headingType: heading,
        setFocusToEnd: true,
      });
    }
    this.menuSelectionService.clearItemAndSelection();
  }

  setBoldStyle($event) {
    $event.preventDefault();
    const content = this.menuSelectionService.currentTextItem;
    this.updateText.emit({
      content,
      textStyle: 'bold',
      updateMode: this.getIsBold() ? UpdateStyleMode.Remove : UpdateStyleMode.Add,
    });
    this.menuSelectionService.clearItemAndSelection();
  }

  setItalicStyle($event) {
    $event.preventDefault();
    const content = this.menuSelectionService.currentTextItem;
    this.updateText.emit({
      content,
      textStyle: 'italic',
      updateMode: this.getIsItalic() ? UpdateStyleMode.Remove : UpdateStyleMode.Add,
    });
    this.menuSelectionService.clearItemAndSelection();
  }

  getIsActiveHeader(heading: HeadingTypeENUM): boolean {
    const item = this.menuSelectionService.currentTextItem;
    if (
      item &&
      item.noteTextTypeId === NoteTextTypeENUM.Heading &&
      item.headingTypeId === heading
    ) {
      return true;
    }
    return false;
  }

  getIsActiveType(type: NoteTextTypeENUM): boolean {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) return false;
    return type === item.noteTextTypeId;
  }

  getIsBold = (): boolean => {
    return this.isSelectionTags(['strong', 'b']);
  };

  getIsItalic = (): boolean => {
    return this.isSelectionTags(['em']);
  };

  isSelectionTags(selTags: string[]): boolean {
    const sel = this.apiBrowserService.getSelection();
    if (!sel) return false;
    const tempDiv = this.getSelectedHTML();
    if (tempDiv.innerHTML === '') return false;

    const tagsSet = new Set<string>();
    for (const node of tempDiv.childNodes as any) {
      let tags = [node.nodeName.toLowerCase()];
      tagsSet.add(node.nodeName.toLowerCase());

      // This covers selection that are inside bolded characters
      while (tags.includes('#text')) {
        const startTag = sel.anchorNode.parentNode.nodeName.toLowerCase();
        const endTag = sel.focusNode.parentNode.nodeName.toLowerCase();
        const startTagParent = sel.anchorNode.parentNode.parentElement.nodeName.toLowerCase();
        const endTagParent = sel.focusNode.parentNode.parentElement.nodeName.toLowerCase();
        tags = [startTag, endTag];
        tagsSet.add(startTag);
        tagsSet.add(endTag);
        tagsSet.add(startTagParent);
        tagsSet.add(endTagParent);
      }
    }

    return selTags.some((x) => tagsSet.has(x));
  }

  getSelectedHTML = (): HTMLDivElement => {
    const selection = this.apiBrowserService.getSelection();
    if (!selection) return;
    const container = document.createElement('div');
    for (let i = 0, len = selection.rangeCount; i < len; ++i) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    return container;
  };
}
