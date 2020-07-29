import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable, Subject } from 'rxjs';
import { Label } from '../models/label';
import { LoadLabels, AddLabel, SetDeleteLabel, UpdateLabel, PositionLabel } from '../state/labels-actions';
import { takeUntil } from 'rxjs/operators';
import Grid, * as Muuri from 'muuri';
import { OrderService, Order, OrderEntity } from 'src/app/shared/services/order.service';



@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  theme = Theme;

  constructor(public pService: PersonalizationService,
              private store: Store,
              private orderService: OrderService) {}


  async ngOnInit() {
    this.pService.onResize();
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel('', '#FFEBCD')).toPromise();
    this.pService.grid.add(document.querySelector('.grid-item'), {index : 0, layout: true});
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
