import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { ApiServiceNotes } from '../api-notes.service';
import { MenuSelectionService } from '../menu-selection.service';
import { ContentType, HeadingType } from '../models/ContentMode';
import { NoteStore } from '../state/notes-state';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss'],
})
export class TextEditMenuComponent {
  contentType = ContentType;

  headingType = HeadingType;

  constructor(
    public menuSelectionService: MenuSelectionService,
    private apiBrowserService: ApiBrowserTextService,
    private api: ApiServiceNotes,
    private store: Store,
  ) {}

  preventUnSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  async transformContent(e, type: ContentType, heading?: HeadingType) {
    const item = this.menuSelectionService.currentItem;
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    if (item.type === type && item.headingType === heading) {
      await this.api.updateContentType(noteId, item.id, ContentType.DEFAULT, null).toPromise();
      item.type = ContentType.DEFAULT;
    } else {
      await this.api.updateContentType(noteId, item.id, type, heading).toPromise();
      item.type = type;
      item.headingType = heading;
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
