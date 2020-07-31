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

export class NotesComponent implements OnInit {

  theme = Theme;

  labelsActive: number[] = [];
  actives = new Map<number, boolean>();

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;


  constructor(public pService: PersonalizationService,
              private store: Store) { }

  async ngOnInit() {
    this.pService.onResize();
    await this.store.dispatch(new LoadLabels()).toPromise();
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

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }
}
