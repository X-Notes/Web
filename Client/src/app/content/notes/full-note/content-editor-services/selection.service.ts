import { ElementRef, Injectable, QueryList } from '@angular/core';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Injectable()
export class SelectionService {
  menuHeight = 49;

  sidebarWidth = 270;

  ismousedown = false;

  isResizingPhoto = false;

  isSelectionInside;

  private selectedItemsSet = new Set<string>();

  selectionHandler(secondRect: DOMRect, elements: QueryList<ParentInteraction>) {
    const idsToAdd = [];
    for (const item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      const content = item.getContent();
      if (this.isRectToRect(firstRect, secondRect)) {
        idsToAdd.push(content.id);
      } else {
        this.selectedItemsSet.delete(content.id);
      }
    }

    if (idsToAdd.length !== 1) {
      idsToAdd.forEach((id) => this.selectedItemsSet.add(id));
    }
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

  selectItems(ids: string[]) {
    ids.forEach((id) => this.selectedItemsSet.add(id));
  }

  removeFromSelectedItems(id: string) {
    this.selectedItemsSet.delete(id);
  }

  isSelectionInZone(
    secondRect: DOMRect,
    elements: QueryList<ParentInteraction>,
    title: ElementRef<HTMLElement>,
  ) {
    if (this.isRectToRect(title.nativeElement.getBoundingClientRect(), secondRect)) {
      return true;
    }
    for (const item of elements) {
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
