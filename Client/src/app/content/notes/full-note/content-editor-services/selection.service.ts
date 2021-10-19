import { ElementRef, Injectable, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Injectable()
export class SelectionService {
  menuHeight = 49;

  sidebarWidth = 270;

  ismousedown = false;

  isResizingPhoto = false;

  isSelectionInside;

  constructor(private apiBrowserService: ApiBrowserTextService, private store: Store) {}

  selectionHandler(secondRect: DOMRect, elements: QueryList<ParentInteraction>) {
    const itemsSelect: HTMLElement[] = [];
    const itemsNoSelect: HTMLElement[] = [];

    for (let item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      if (this.isRectToRect(firstRect, secondRect)) {
        itemsSelect.push(html.firstChild as HTMLElement);
      } else {
        itemsNoSelect.push(html.firstChild as HTMLElement);
      }
    }
    this.makeSelect(itemsSelect);
    this.makeNoSelect(itemsNoSelect);
  }

  makeSelect(items: HTMLElement[]) {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const refElements = [...items];
    if (this.isSelectionInside) {
      if (refElements.length === 1) {
        refElements[0].style.backgroundColor = null;
        return;
      }
      this.apiBrowserService.getSelection().empty();
    }
    for (const elem of refElements) {
      if (theme === ThemeENUM.Dark) {
        elem.style.backgroundColor = '#2a2d32';
      } else {
        elem.style.backgroundColor = '#f3f3f3';
      }
      elem.setAttribute('selectedByUser', 'true');
    }
  }

  makeNoSelect = (refElements: HTMLElement[]) => {
    for (const elem of refElements) {
      elem.style.backgroundColor = null;
      elem.removeAttribute('selectedByUser');
    }
  };

  isSelectionInZone(secondRect: DOMRect, elements: QueryList<ParentInteraction>) {
    for (let item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      if (this.isRectToRect(firstRect, secondRect)) {
        return true;
      }
    }
    return false;
  }

  isRectToRect = (firstRect: DOMRect, secondRect: DOMRect) => {
    return (
      firstRect.x < secondRect.x + secondRect.width &&
      secondRect.x < firstRect.x + firstRect.width &&
      firstRect.y < secondRect.y + secondRect.height &&
      secondRect.y < firstRect.y + firstRect.height
    );
  };
}
