import { Component, EventEmitter, Output } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { MenuSelectionService } from '../content-editor-services/menu-selection.service';
import { BaseText, HeadingTypeENUM, NoteTextTypeENUM } from '../../models/content-model.model';
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
  updateText = new EventEmitter<BaseText>();

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
    content.isBoldSG = !content.isBoldSG;
    this.updateText.emit(content);
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  setItalicStyle($event) {
    $event.preventDefault();
    const content = this.menuSelectionService.currentTextItem;
    content.isItalicSG = !content.isItalicSG;
    this.updateText.emit(content);
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  getIsActive(type: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) {
      return;
    }

    if (type === NoteTextTypeENUM.Heading && item.noteTextTypeIdSG === type) {
      // eslint-disable-next-line consistent-return
      return heading === item.headingTypeIdSG ? 'active' : '';
    }
    // eslint-disable-next-line consistent-return
    return type === item.noteTextTypeIdSG ? 'active' : '';
  }
}
