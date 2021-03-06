import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { ApiServiceNotes } from '../api-notes.service';
import { MenuSelectionService } from '../menu-selection.service';
import { BaseText, ContentType, HeadingType } from '../models/ContentMode';
import { NoteStore } from '../state/notes-state';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss']
})
export class TextEditMenuComponent implements OnInit {

  constructor(
    public menuSelectionService: MenuSelectionService,
    private apiBrowserService: ApiBrowserTextService,
    private api: ApiServiceNotes,
    private store: Store
  ) { }

  contentType = ContentType;
  headingType = HeadingType;

  ngOnInit(): void {
  }

  preventUnSelection(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  async transformContent(e, type: ContentType, heading?: HeadingType) {
    const item = this.menuSelectionService.currentItem;
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    if (item.type === type && item.headingType === heading) {
      await this.api.updateContentType(noteId, item.id, ContentType.DEFAULT, null).toPromise();
      item.type = ContentType.DEFAULT;
    }
     else {
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
      return heading === item.headingType ? 'active' : '';
    } else {
      return type === item.type ? 'active' : '';
    }

  }

}
