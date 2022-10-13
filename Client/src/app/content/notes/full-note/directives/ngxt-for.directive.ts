/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/no-input-rename */
import {
  Directive,
  DoCheck,
  Input,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  TemplateRef,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngxtFor]',
})
export class NgxtForDirective implements DoCheck {
  private items: any[] = [];

  private viewRefsMap: Map<any, ViewRef> = new Map<any, ViewRef>();

  private _diffrence: IterableDiffer<any> | undefined;

  @Input('ngxtForItemsAtOnce')
  public itemsAtOnce = 10;

  @Input('ngxtForIntervalLength')
  public intervalLength = 50;

  @Input('ngxtForOf')
  public set ngxtForOf(items: any) {
    this.items = items;
    if (items) {
      this._diffrence = this.differs.find(items).create();
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
    if (this._diffrence) {
      const changes = this._diffrence.diff(this.items);
      if (changes) {
        const itemsAdded: any[] = [];
        changes.forEachAddedItem((item) => {
          itemsAdded.push(item);
        });

        this.progressiveRender(itemsAdded);

        changes.forEachRemovedItem((item) => {
          const mapView = this.viewRefsMap.get(item.item) as ViewRef;
          const viewIndex = this.viewContainer.indexOf(mapView);
          this.viewContainer.remove(viewIndex);
          this.viewRefsMap.delete(item.item);
        });
      }
    }
  }

  private progressiveRender(items: IterableChangeRecord<any>[]) {
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

  private renderItems(items: IterableChangeRecord<any>[], start: number, end: number) {
    items.slice(start, end).forEach((item) => {
      const embeddedView = this.viewContainer.createEmbeddedView(
        this.templateRef,
        {
          $implicit: item.item,
        },
        item.currentIndex || 0,
      );
      this.viewRefsMap.set(item.item, embeddedView);
    });
  }
}
