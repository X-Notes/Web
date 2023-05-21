/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/no-input-rename */
import {
  Directive,
  DoCheck,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  TemplateRef,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ContentModelBase } from '../../models/editor-models/content-model-base';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[lazyFor]',
})
export class LazyForDirective implements DoCheck {
  private items: ContentModelBase[] = [];

  private viewRefsMap: Map<ContentModelBase, ViewRef> = new Map<ContentModelBase, ViewRef>();

  private diffsChecker: IterableDiffer<any> | undefined;

  // usage *lazyFor="let item of contents; itemsAtOnce: 400; onChange: ngForSubject; intervalLength: 5000; let i = index"

  @Input('lazyForItemsAtOnce')
  public itemsAtOnce = 10;

  @Input('lazyForIntervalLength')
  public intervalLength = 50;

  @Input('lazyForOnChange')
  public onChange: Subject<void> = null;

  @Input('lazyForOf')
  public set lazyForOf(items: ContentModelBase[]) {
    this.items = items;
    if (items) {
      this.diffsChecker = this.differs.find(items).create<ContentModelBase>((index, item) => item);
    }
    //Clear any existing items
    this.viewContainer.clear();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private differs: IterableDiffers,
  ) {}

  public ngDoCheck(): void {
    if (this.diffsChecker) {
      const changes = this.diffsChecker.diff(this.items);
      if (changes) {
        const itemsAdded = this.getItemsToAdd(changes);
        // const getItemsIdentityChange = this.getItemsIdentityChange(changes);
        this.changePositionsItemsDOM(changes);
        this.removeItemsFromDOM(changes);

        this.progressiveRender(itemsAdded);

        this.onChange?.next();
      }
    }
  }

  private getItemsToAdd(
    changes: IterableChanges<ContentModelBase>,
  ): IterableChangeRecord<ContentModelBase>[] {
    const itemsAdded: any[] = [];
    changes.forEachAddedItem((item) => {
      itemsAdded.push(item);
    });
    return itemsAdded;
  }

  private getItemsIdentityChange(
    changes: IterableChanges<ContentModelBase>,
  ): IterableChangeRecord<ContentModelBase>[] {
    const items: any[] = [];
    changes.forEachIdentityChange((item) => {
      items.push(item);
    });
    return items;
  }

  private getItemsMovedItems(
    changes: IterableChanges<ContentModelBase>,
  ): IterableChangeRecord<ContentModelBase>[] {
    const items: any[] = [];
    changes.forEachMovedItem((item) => {
      items.push(item);
    });
    return items;
  }

  private getItemsRemovedItem(
    changes: IterableChanges<ContentModelBase>,
  ): IterableChangeRecord<ContentModelBase>[] {
    const items: IterableChangeRecord<ContentModelBase>[] = [];
    changes.forEachRemovedItem((item) => {
      items.push(item);
    });
    return items;
  }

  private removeItemsFromDOM(changes: IterableChanges<ContentModelBase>): void {
    const getItemsRemovedItem = this.getItemsRemovedItem(changes);
    getItemsRemovedItem.forEach((item) => this.removeFromDOM(item));
  }

  private removeFromDOM(item: IterableChangeRecord<ContentModelBase>): void {
    const mapView = this.viewRefsMap.get(item.item) as ViewRef;
    const viewIndex = this.viewContainer.indexOf(mapView);
    this.viewContainer.remove(viewIndex);
    this.viewRefsMap.delete(item.item);
  }

  private changePositionsItemsDOM(changes: IterableChanges<ContentModelBase>): void {
    const getItemsMovedItems = this.getItemsMovedItems(changes);
    getItemsMovedItems.forEach((item) => this.removeFromDOM(item));
    this.renderItems(getItemsMovedItems, 0, getItemsMovedItems.length);
  }

  private progressiveRender(items: IterableChangeRecord<ContentModelBase>[]) {
    let interval: NodeJS.Timer = null;
    let start = 0;
    let end = start + this.itemsAtOnce;
    if (end > items.length) {
      end = items.length;
    }
    this.renderItems(items, start, end);

    interval = setInterval(() => {
      start = end;
      end = start + this.itemsAtOnce;
      if (end > items.length) {
        end = items.length;
      }
      this.renderItems(items, start, end);
      if (start >= items.length) {
        clearInterval(interval);
      }
    }, this.intervalLength);
  }

  private renderItems(items: IterableChangeRecord<ContentModelBase>[], start: number, end: number) {
    items.slice(start, end).forEach((item, index, array) => {
      const embeddedView = this.viewContainer.createEmbeddedView(
        this.templateRef,
        {
          $implicit: item.item,
          index,
          first: index === 0,
          last: index === array.length - 1,
          even: (index && 1) === 0,
          odd: (index && 1) === 1,
          count: array.length,
        },
        item.currentIndex || 0,
      );
      this.viewRefsMap.set(item.item, embeddedView);
    });
    this.onChange?.next();
  }
}
