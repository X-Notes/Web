import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, AfterViewChecked, NgZone } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { takeUntil, take, tap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../../labels/state/labels-state';
import { Label } from '../../labels/models/label';
import { LoadLabels } from '../../labels/state/labels-actions';
import { DragService } from 'src/app/shared/services/drag.service';
import Grid, * as Muuri from 'muuri';
import { SmallNote } from '../models/smallNote';
import { NoteStore } from '../state/notes-state';
import { LoadSmallNotes, AddNote } from '../state/notes-actions';
import { Router } from '@angular/router';

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

  destroy = new Subject<void>();
  current: subMenu;
  menu = subMenu;
  theme = Theme;

  labelsActive: number[] = [];
  actives = new Map<number, boolean>();

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  @Select(NoteStore.allSmall)
  public notes$: Observable<SmallNote[]>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              private router: Router,
              public dragService: DragService,
              private zone: NgZone) { }


  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.pService.onResize();
    await this.store.dispatch(new LoadLabels()).toPromise();
    await this.store.dispatch(new LoadSmallNotes()).toPromise();

    this.current = subMenu.All;

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newNote());

    const dragHelper = document.querySelector('.drag-helper') as HTMLElement;


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

  }

  ngAfterViewInit() {
  }

  async newNote() {
    await this.store.dispatch(new AddNote()).toPromise();
    this.notes$.pipe(take(1)).subscribe(x => this.router.navigate([`notes/w/${x[0].writeId}`]));
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
