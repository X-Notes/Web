import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Person } from '../models/person';
import { CdkDropListGroup, CdkDropList, moveItemInArray, CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/scrolling';

export enum subMenu {
  All = 'all',
  Invitations = 'invitations'
}

export interface People {
  id: number;
  name: string;
  email: string;
  color: string;
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class PeopleComponent implements OnInit, OnDestroy, AfterViewInit {
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

  items: Person[] = [
    {id: 1, name: '123', email: '123@sdks.com', color: '#CDFFD8'},
    {id: 2, name: '123', email: '123@sdks.com', color: '#DDFFCD'},
    {id: 3, name: '123', email: '123@sdks.com', color: '#FFFDCD'},
    {id: 2, name: '123', email: '123@sdks.com', color: '#DDFFCD'},
    {id: 3, name: '123', email: '123@sdks.com', color: '#FFFDCD'},
    {id: 1, name: '123', email: '123@sdks.com', color: '#CDFFD8'},
    {id: 2, name: '123', email: '123@sdks.com', color: '#DDFFCD'},
    {id: 3, name: '123', email: '123@sdks.com', color: '#FFFDCD'},
    {id: 2, name: '123', email: '123@sdks.com', color: '#DDFFCD'},
  ];

  constructor(public pService: PersonalizationService, private viewportRuler: ViewportRuler) {
    this.target = null;
    this.source = null;
   }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.current = subMenu.All;
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newPeople());
  }

  ngAfterViewInit() {
    const phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  newPeople() {
    console.log('new people');
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  dragMoved(e: CdkDragMove) {
    const point = this.getPointerPositionOnPage(e.event);
    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
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
      moveItemInArray(this.items, this.sourceIndex, this.targetIndex);
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
    const dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    const dropIndex = __indexOf(dropElement.parentElement.children, dropElement);


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

  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
            x: point.pageX - scrollPosition.left,
            y: point.pageY - scrollPosition.top
        };
    }

}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
}

function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right;
}
