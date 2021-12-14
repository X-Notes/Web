import { Component, EventEmitter, Output } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { HeadingTypeENUM, NoteTextTypeENUM } from '../../models/editor-models/base-text';
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
    if (item.noteTextTypeIdSG === type && item.headingTypeIdSG === heading) {
      this.eventTransform.emit({
        id: item.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      this.eventTransform.emit({
        id: item.id,
        textType: type,
        headingType: heading,
        setFocusToEnd: true,
      });
    }
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  setBoldStyle($event) {
    $event.preventDefault();
    const content = this.menuSelectionService.currentTextItem;
    this.updateText.emit({
      content,
      textStyle: 'bold',
      updateMode: this.getIsBold() ? UpdateStyleMode.Remove : UpdateStyleMode.Add,
    });
  }

  setItalicStyle($event) {
    $event.preventDefault();
    const content = this.menuSelectionService.currentTextItem;
    this.updateText.emit({
      content,
      textStyle: 'italic',
      updateMode: this.getIsItalic() ? UpdateStyleMode.Remove : UpdateStyleMode.Add,
    });
  }

  getIsActiveHeader(type: NoteTextTypeENUM, heading: HeadingTypeENUM): boolean {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) {
      return null;
    }
    if (type === NoteTextTypeENUM.Heading && item.noteTextTypeIdSG === type) {
      return heading === item.headingTypeIdSG;
    }
    return type === item.noteTextTypeIdSG;
  }

  getIsActiveType(type: NoteTextTypeENUM): boolean {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) {
      return null;
    }
    return type === item.noteTextTypeIdSG;
  }

  getIsBold = (): boolean => {
    return this.menuSelectionService.currentHtmlItem?.includes('<strong>');
  };

  getIsItalic = (): boolean => {
    return this.menuSelectionService.currentHtmlItem?.includes('<em>');
  };
}
