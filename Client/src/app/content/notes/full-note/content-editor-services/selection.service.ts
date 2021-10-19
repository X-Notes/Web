import { Injectable, QueryList } from '@angular/core';
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

  private selectedItemsSet = new Set<string>();

  constructor(private apiBrowserService: ApiBrowserTextService, private store: Store) {}

  selectionHandler(secondRect: DOMRect, elements: QueryList<ParentInteraction>) {
    for (let item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      const content = item.getContent();
      if (this.isRectToRect(firstRect, secondRect)) {
        this.selectedItemsSet.add(content.id);
      } else {
        this.selectedItemsSet.delete(content.id);
      }
    }
    // this.makeSelect(itemsSelect);
    // this.makeNoSelect(itemsNoSelect);
  }

  isAnySelect(): boolean {
    return this.selectedItemsSet.size > 0;
  }

  isSelected(id: string) {
    return this.selectedItemsSet.has(id);
  }

  getSelectedItems(): string[] {
    return Array.from(this.selectedItemsSet);
  }

  removeFromSelectedItems(id: string){
    this.selectedItemsSet.delete(id);
  }

  makeSelect(items: HTMLElement[]) { // TODO REMOVE
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

  makeNoSelect = (refElements: HTMLElement[]) => { // TODO REMOVE
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
