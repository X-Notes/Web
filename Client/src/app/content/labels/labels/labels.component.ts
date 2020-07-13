import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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

  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;

  destroy = new Subject<void>();
  current: subMenu;
  menu = subMenu;
  theme = Theme;

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  constructor(public pService: PersonalizationService,
              private store: Store, public dragService: DragService,
              private cdRef: ChangeDetectorRef) {
                this.target = null;
                this.source = null;
              }


  ngOnInit(): void {
    this.pService.onResize();
    this.current = subMenu.All;
    this.store.dispatch(new LoadLabels());
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());
  }


  ngAfterViewInit() {
    const phElement = this.placeholder.element.nativeElement;
    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel('Name your label...', '#FFEBCD')).toPromise();
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  delete(id: number) {
    this.store.dispatch(new DeleteLabel(id));
  }

  dragMoved(e: CdkDragMove) {
    const point = this.dragService.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (this.dragService.dragIsInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  dropListDropped() {
    if (!this.target) {
      return;
    }

    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex !== this.targetIndex) {
      let array;
      this.labels$.subscribe(x => {
        array = x;
        moveItemInArray(array, this.sourceIndex, this.targetIndex);
        this.store.dispatch(new PositionLabel(array[this.sourceIndex], array[this.targetIndex]));
      });
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop === this.placeholder) {
      return true;
    }

    if (drop !== this.activeContainer) {
      return false;
    }

    const phElement = this.placeholder.element.nativeElement;
    const sourceElement = drag.dropContainer.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    const dragIndex = this.dragService.dragIndexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    const dropIndex = this.dragService.dragIndexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex
      ? dropElement.nextSibling : dropElement));

    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}
