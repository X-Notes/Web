import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { ApiServiceNotes } from '../api-notes.service';
import { MenuSelectionService } from '../menu-selection.service';
import { ContentType, HeadingType } from '../models/ContentMode';
import { TransformContent } from '../models/transform-content';
import { NoteStore } from '../state/notes-state';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss'],
})
export class TextEditMenuComponent {
  @Output()
  eventTransform = new EventEmitter<TransformContent>();

  contentType = ContentType;

  headingType = HeadingType;

  constructor(
    public menuSelectionService: MenuSelectionService,
    private apiBrowserService: ApiBrowserTextService,
  ) {}

  preventUnSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  async transformContent(e, type: ContentType, heading?: HeadingType) {
    const item = this.menuSelectionService.currentItem;
    if (item.type === type && item.headingType === heading) {
      this.eventTransform.emit({
        id: item.id,
        contentType: ContentType.DEFAULT,
        setFocusToEnd: true,
      });
    } else {
      this.eventTransform.emit({
        id: item.id,
        contentType: type,
        headingType: heading,
        setFocusToEnd: true,
      });
    }
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  getIsActive(type: ContentType, heading?: HeadingType) {
    const item = this.menuSelectionService.currentItem;
    if (!item) {
      return;
    }

    if (type === ContentType.HEADING && item.type === type) {
      // eslint-disable-next-line consistent-return
      return heading === item.headingType ? 'active' : '';
    }
    // eslint-disable-next-line consistent-return
    return type === item.type ? 'active' : '';
  }
}
