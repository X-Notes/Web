import { ElementRef, Injectable, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { map } from 'rxjs/operators';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ParentInteraction } from '../components/parent-interaction.interface';
import { TextEditMenuEnum } from '../components/text-edit-menu/models/text-edit-menu.enum';
import { ContentModelBase } from '../entities/contents/content-model-base';

@Injectable()
export class SelectionService {
  isResizingPhoto = false;

  onSelectChanges$ = new BehaviorSubject<void>(null);

  disableDiv$ = new BehaviorSubject<boolean>(false);

  selectionDivActive$ = new BehaviorSubject(false);

  getSelectionDivActive$ = combineLatest([this.disableDiv$, this.selectionDivActive$]).pipe(
    map(([disableDiv, selectionDivActive]) => !disableDiv && selectionDivActive),
  );

  getSelectionDivActiveMultiplyRows$ = combineLatest([this.getSelectionDivActive$]).pipe(
    map(() => this.selectedMenuType === TextEditMenuEnum.MultiplyRows),
  );

  private selectionTop = 0;

  private selectionLeft = 0;

  private selectedItemId: string;

  private selectedItemsSet = new Set<string>();

  constructor(
    private pS: PersonalizationService,
    private apiBrowserService: ApiBrowserTextService,
    private router: Router,
  ) {}

  get selectedMenuType(): TextEditMenuEnum {
    if (this.selectedItemId && this.selectedItemsSet.size === 0) {
      return TextEditMenuEnum.OneRow;
    }
    if (this.selectedItemsSet.size !== 0) {
      return TextEditMenuEnum.MultiplyRows;
    }
    return null;
  }

  get sidebarWidth(): number {
    return this.router.url.includes('public')
      ? document.getElementById('public-left-section').offsetWidth
      : 270;
  }

  get getCursorLeft(): number {
    if (this.pS.windowWidth$.value < this.pS.startMobileWidth) {
      return 0;
    }
    return this.selectionLeft;
  }

  get getCursorTop() {
    if (this.pS.windowWidth$.value < this.pS.startMobileWidth) {
      return 0;
    }
    return this.selectionTop;
  }

  updateSelectionValue(flag: boolean): void {
    this.selectionDivActive$.next(flag);
  }

  selectionHandler(
    secondRect: DOMRect,
    elements: QueryList<ParentInteraction<ContentModelBase>>,
    isInternalSelect: boolean,
  ) {
    let isHasChanges = false;
    const contentToSelect: ContentModelBase[] = [];
    for (const item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      const content = item.getContent();
      if (this.isRectToRect(firstRect, secondRect)) {
        contentToSelect.push(content);
      } else {
        this.selectedItemsSet.delete(content.id);
        isHasChanges = true;
      }
    }

    if (isInternalSelect) {
      if (contentToSelect.length !== 1) {
        contentToSelect.forEach((content) => this.selectedItemsSet.add(content.id));
        isHasChanges = true;
      }
    } else {
      contentToSelect.forEach((content) => this.selectedItemsSet.add(content.id));
      isHasChanges = true;
    }

    if (isHasChanges) {
      this.onSetChanges();
    }
  }

  isAnySelect(): boolean {
    return this.selectedItemsSet.size > 0;
  }

  isSelected(id: string) {
    return this.selectedItemsSet.has(id);
  }

  isSelectedAll(id: string) {
    return this.isSelected(id) || this.selectedItemId === id;
  }

  getSelectedItems(): string[] {
    return Array.from(this.selectedItemsSet).filter((x) => x);
  }

  getAllSelectedItems(): string[] {
    return [...this.getSelectedItems(), this.selectedItemId].filter((x) => x);
  }

  selectItems(ids: string[]) {
    ids.forEach((id) => this.selectedItemsSet.add(id));
    this.onSetChanges();
  }

  removeFromSelectedItems(id: string) {
    this.selectedItemsSet.delete(id);
    this.onSetChanges();
  }

  resetSelectionItems(): void {
    this.disableDiv$.next(false);
    this.selectedItemId = null;
    this.selectedItemsSet.clear();
    this.onSetChanges();
  }

  resetSelectionAndItems(): void {
    this.apiBrowserService.removeAllRanges();
    this.resetSelectionItems();
  }

  onSetChanges(): void {
    this.onSelectChanges$.next();
  }

  isSelectionInZone(
    secondRect: DOMRect,
    elements: QueryList<ParentInteraction<ContentModelBase>>,
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

  initSingle(id: string, scrollElement: HTMLElement, selectionCoords: DOMRect): void {
    this.selectedItemId = id;

    const left = (selectionCoords.left + selectionCoords.right) / 2;
    const top = selectionCoords.top + scrollElement?.scrollTop - 5;
    this.selectionTop = top;
    this.selectionLeft = left;

    this.onSetChanges();
  }
}
