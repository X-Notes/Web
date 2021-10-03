import { Component, EventEmitter, Output } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { MenuSelectionService } from '../services/menu-selection.service';
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

  async transformContent(e, type: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    const item = this.menuSelectionService.currentItem;
    if (item.noteTextTypeId === type && item.headingTypeId === heading) {
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
    const content = this.menuSelectionService.currentItem;
    content.isBold = !content.isBold;
    this.updateText.emit(content);
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  setItalicStyle($event) {
    $event.preventDefault();
    const content = this.menuSelectionService.currentItem;
    content.isItalic = !content.isItalic;
    this.updateText.emit(content);
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  getIsActive(type: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    const item = this.menuSelectionService.currentItem;
    if (!item) {
      return;
    }

    if (type === NoteTextTypeENUM.Heading && item.noteTextTypeId === type) {
      // eslint-disable-next-line consistent-return
      return heading === item.headingTypeId ? 'active' : '';
    }
    // eslint-disable-next-line consistent-return
    return type === item.noteTextTypeId ? 'active' : '';
  }
}
