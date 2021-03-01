import { Component, OnInit } from '@angular/core';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { MenuSelectionService } from '../menu-selection.service';
import { BaseText, ContentType, HeadingType } from '../models/ContentMode';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss']
})
export class TextEditMenuComponent implements OnInit {

  constructor(
    public menuSelectionService: MenuSelectionService,
    private apiBrowserService: ApiBrowserTextService
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

  transformContent(e, type: ContentType, heading?: HeadingType) {
    const item = this.menuSelectionService.currentItem;
    if (item.type === type) {
      if (item.type === ContentType.HEADING) {
        const itemH = this.menuSelectionService.currentItem as BaseText;
        if (itemH.headingType === heading) {
          itemH.type = ContentType.DEFAULT;
        } else {
          itemH.headingType = heading;
        }
      } else {
        item.type = ContentType.DEFAULT;
      }
    }
    else if (type === ContentType.HEADING) {
      const itemH = this.menuSelectionService.currentItem as BaseText;
      itemH.type = type;
      itemH.headingType = heading;
    } else {
      item.type = type;
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
      const Hitem = item as any;
      return heading === Hitem.data.headingType ? 'active' : '';
    } else {
      return type === item.type ? 'active' : '';
    }

  }

}
