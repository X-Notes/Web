import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable, Subject } from 'rxjs';
import { Label } from '../models/label';
import { LoadLabels, AddLabel, DeleteLabel, UpdateLabel, PositionLabel } from '../state/labels-actions';
import { takeUntil } from 'rxjs/operators';
import { CdkDragMove, CdkDropListGroup, CdkDropList, moveItemInArray, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragService } from 'src/app/shared/services/drag.service';
import Grid, * as Muuri from 'muuri';

export enum subMenu {
  All = 'all',
  Bin = 'bin'
}

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit, OnDestroy, AfterViewInit {

  destroy = new Subject<void>();
  current: subMenu;
  menu = subMenu;
  theme = Theme;

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public dragService: DragService,
              private zone: NgZone) {}


  ngOnInit(): void {
    this.pService.onResize();
    this.current = subMenu.All;

    this.store.dispatch(new LoadLabels());

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());

    const dragHelper = document.querySelector('.drag-helper') as HTMLElement;

    this.zone.runOutsideAngular(() => setTimeout(() => {
      this.pService.grid = new Muuri.default('.grid', {
        items: '.grid-item',
        dragEnabled: true,
        layout: {
          fillGaps: false,
          horizontal: false,
          alignRight: false,
          alignBottom: false,
          rounding: true
        },
        dragContainer: dragHelper,
        dragRelease: {
          useDragContainer: false
        },
        dragCssProps: {
          touchAction: 'auto'
        },
        dragStartPredicate(item, e) {
          if ( e.deltaTime > 300) {
            if ((e.type === 'move' || e.type === 'start')) {
              item.getGrid()
              .getItems()
              .forEach(
                elem => elem.getElement().style.touchAction = 'none');
              console.log(item.getGrid().getItems().indexOf(item));
              return true;
            } else if (e.type === 'end' || e.type === 'cancel') {
              item.getGrid()
              .getItems()
              .forEach(
                elem => elem.getElement().style.touchAction = 'auto');
              return true;
            }
          }
        },
        dragPlaceholder: {
          enabled: true,
          createElement(item: any) {
            return item.getElement().cloneNode(true);
          }
        },
        dragAutoScroll: {
          targets: [
            { element: window, priority: -1 },
            { element: document.querySelector('.content-inner .simplebar-content-wrapper') as HTMLElement, priority: 1, axis: 2 },
          ],
          sortDuringScroll: false,
          smoothStop: true,
          safeZone: 0.1
        }
      });
    }, 300));
  }


  ngAfterViewInit() {
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel('', '#FFEBCD')).toPromise();
    this.pService.grid.add(document.querySelector('.grid-item'), {index : 0, layout: true});
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
    this.pService.grid.refreshItems().layout();
  }

  delete(id: number) {
    this.store.dispatch(new DeleteLabel(id));
    this.labels$.subscribe( () => {
      this.pService.grid.refreshItems().layout();
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}
