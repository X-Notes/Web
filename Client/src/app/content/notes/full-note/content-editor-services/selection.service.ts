import { ElementRef, Injectable, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Injectable()
export class SelectionService {
  constructor(private router: Router) {}

  menuHeight = 49;

  isResizingPhoto = false;

  private selectedItemsSet = new Set<string>();

  get sidebarWidth(): number {
    return this.router.url.includes('public') ? document.getElementById('public-left-section').offsetWidth : 270;
  }

  selectionHandler(
    secondRect: DOMRect,
    elements: QueryList<ParentInteraction>,
    isIternalSelect: boolean,
  ) {
    const contentToSelect: ContentModelBase[] = [];
    for (const item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      const content = item.getContent();
      if (this.isRectToRect(firstRect, secondRect)) {
        contentToSelect.push(content);
      } else {
        this.selectedItemsSet.delete(content.id);
      }
    }

    if (isIternalSelect) {
      if (contentToSelect.length !== 1) {
        contentToSelect.forEach((content) => this.selectedItemsSet.add(content.id));
      }
    } else {
      contentToSelect.forEach((content) => this.selectedItemsSet.add(content.id));
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

  resetSelectionItems(): void {
    this.selectedItemsSet.clear();
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
