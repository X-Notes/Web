import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../../labels/state/labels-state';
import { Label } from '../../labels/models/label';
import { LoadLabels } from '../../labels/state/labels-actions';
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragService } from 'src/app/shared/services/drag.service';
import { Note } from '../models/Note';
import Grid, { GridOptions } from 'muuri';

export enum subMenu {
  All = 'all',
  Shared = 'shared',
  Locked = 'locked',
  Archive = 'archive',
  Bin = 'bin'
}


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  animations: [ sideBarCloseOpen ]
})

export class NotesComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public pService: PersonalizationService,
              private store: Store,
              public dragService: DragService) { }

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
  notes: Note[] = [{description: 'bla blabla bla bllabla bla blabla bla b bla111111111111111111111111111111111111111111111 12312 3123 12321312312312 312'},
                  {description: 'bla bla bllabla bla blabla bla bla'},
                  {description: 'bla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla bla'},
                  {description: 'bla bla blabla bla a bla bla'},
                  {description: 'bla bla blabla bla a bla bla'},
                  {description: 'bla bla blabla bla a bla bla'}];

  labelsActive: number[] = [];
  actives = new Map<number, boolean>();
  // container;
  // items;
  // gridCols;
  // vertSum = [];
  // gridItems = [];

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  public layoutConfig: GridOptions = {
    items: [],
    layoutOnInit: true,
    dragEnabled: true,
    layout: {
        fillGaps: false,
        horizontal: false,
        alignRight: false,
        alignBottom: false,
        rounding: true
    },
  };

  public grid;

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.pService.onResize();
    this.store.dispatch(new LoadLabels());
    this.current = subMenu.All;
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newNote());
    this.grid = new Grid(document.getElementsByClassName('grid')[0] as HTMLElement, this.layoutConfig);
  }

  ngAfterViewInit() {
    this.grid.refreshItems().layout();
  }

  newNote() {
    console.log('new note');
  }

  cancelLabel() {
    this.labelsActive = [];
    this.actives = new Map();
  }

  cancelAdd(id: number) {
    const flag = (this.actives.get(id) === undefined) || (this.actives.get(id) === false) ? true : false;
    this.actives.set(id, flag);
    if (flag) {
      this.labelsActive.push(id);
    } else {
      this.labelsActive = this.labelsActive.filter(x => x !== id);
    }
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }
}
