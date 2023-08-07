import { Injectable, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ParentInteraction } from '../components/parent-interaction.interface';
import { EditorSelectionEnum } from '../entities-ui/editor-selection.enum';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { EditorSelectionModeEnum } from '../entities-ui/editor-selection-mode.enum';

@Injectable()
export class SelectionService {
  isResizingPhoto$ = new BehaviorSubject<boolean>(false);

  onSelectChanges$ = new BehaviorSubject<void>(null);

  disableDiv$ = new BehaviorSubject<boolean>(false);

  selectionDivActive$ = new BehaviorSubject(false);

  selectionTextItemId: string;

  getSelectionDivActive$ = combineLatest([this.disableDiv$, this.selectionDivActive$]).pipe(
    map(([disableDiv, selectionDivActive]) => !disableDiv && selectionDivActive),
  );

  private selectedItemsSet = new Set<string>();

  constructor(
    private apiBrowserService: ApiBrowserTextService,
    private router: Router,
  ) { }

  get selectedMenuType(): EditorSelectionEnum {
    if (this.selectedItemsSet.size <= 0) {
      return EditorSelectionEnum.None;
    }
    if (this.selectedItemsSet.size === 1) {
      return EditorSelectionEnum.One;
    }
    return EditorSelectionEnum.MultiplyRows;
  }

  get isDefaultSelection(): boolean {
    if (this.selectedMenuType === EditorSelectionEnum.None && this.selectionTextItemId) {
      return true;
    }
    if (this.selectedMenuType === EditorSelectionEnum.One && this.selectionTextItemId === this.getFirstItem()) {
      return true;
    }
    return false;
  }

  get selectionMode(): EditorSelectionModeEnum {
    if (this.selectedMenuType === EditorSelectionEnum.MultiplyRows) {
      return EditorSelectionModeEnum.MultiplyRows;
    }
    if (this.isDefaultSelection && this.apiBrowserService.isSelectionEmpty()) {
      return EditorSelectionModeEnum.DefaultSelectionEmpty;
    }
    if (this.isDefaultSelection && !this.apiBrowserService.isSelectionEmpty()) {
      return EditorSelectionModeEnum.DefaultSelection;
    }
    if (this.selectedMenuType === EditorSelectionEnum.One) {
      return EditorSelectionModeEnum.EntireRow;
    }
    return EditorSelectionModeEnum.None;
  }

  get isMultiSelect(): boolean {
    return this.selectionMode === EditorSelectionModeEnum.EntireRow || this.selectionMode === EditorSelectionModeEnum.MultiplyRows;
  }

  get sidebarWidth(): number {
    return this.router.url.includes('public')
      ? document.getElementById('public-left-section').offsetWidth
      : 270;
  }

  updateSelectionValue(flag: boolean): void {
    this.selectionDivActive$.next(flag);
  }

  selectionHandler(
    x: number, y: number, width: number, height: number,
    elements: QueryList<ParentInteraction<ContentModelBase>>
  ) {
    let isDeleted = false;
    const contentToSelect: ContentModelBase[] = [];
    for (const item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      const content = item.getContent();
      if (this.isRectToRect(firstRect, x, y, width, height)) {
        contentToSelect.push(content);
      } else {
        this.selectedItemsSet.delete(content.id);
        isDeleted = true;
      }
    }

    contentToSelect.forEach((content) => {
      this.selectedItemsSet.add(content.id);
    });

    if (isDeleted || contentToSelect.length > 0) {
      this.onSetChanges();
    }
  }

  isAnySelect(): boolean {
    return this.selectedItemsSet.size > 0;
  }

  isSelected(id: string) {
    return this.selectedItemsSet.has(id);
  }

  getFirstItem(): string {
    return this.getSelectedItems()[0];
  }

  getSelectedItems(): string[] {
    return Array.from(this.selectedItemsSet);
  }

  selectItems(ids: string[]) {
    ids.forEach((id) => this.selectedItemsSet.add(id));
    this.onSetChanges();
  }

  removeFromSelectedItems(id: string) {
    this.selectedItemsSet.delete(id);
    this.onSetChanges();
  }

  resetSelectedItems(): void {
    this.disableDiv$.next(false);
    this.selectedItemsSet.clear();
    this.onSetChanges();
  }

  resetSelectionAndItems(): void {
    this.apiBrowserService.removeAllRanges();
    this.resetSelectedItems();
  }

  onSetChanges(): void {
    this.onSelectChanges$.next();
  }

  isSelectionInZone(
    x: number, y: number, width: number, height: number,
    elements: QueryList<ParentInteraction<ContentModelBase>>
  ): ParentInteraction<ContentModelBase> | null {
    for (const item of elements) {
      const html = item.getHost().nativeElement;
      const firstRect = html.getBoundingClientRect();
      if (this.isRectToRect(firstRect, x, y, width, height)) {
        return item;
      }
    }
    return null;
  }

  isRectToRect = (firstRect: DOMRect, x: number, y: number, width: number, height: number) => {
    return (
      firstRect.x < x + width &&
      x < firstRect.x + firstRect.width &&
      firstRect.y < y + height &&
      y < firstRect.y + firstRect.height
    );
  };
}
