import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, AfterViewChecked, NgZone } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { takeUntil, take, tap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../../labels/state/labels-state';
import { Label } from '../../labels/models/label';
import { LoadLabels } from '../../labels/state/labels-actions';
import Grid, * as Muuri from 'muuri';
import { SmallNote } from '../models/smallNote';
import { NoteStore } from '../state/notes-state';
import { LoadSmallNotes, AddNote } from '../state/notes-actions';
import { Router } from '@angular/router';
import { Order, OrderEntity, OrderService } from 'src/app/shared/services/order.service';

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

export class NotesComponent implements OnInit, OnDestroy {

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
              private orderService: OrderService) { }


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

    this.pService.gridSettings();

    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      await this.orderService.changeOrder(order).toPromise();
      });
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
