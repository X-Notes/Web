import { Component, OnInit, AfterContentInit, Input, OnDestroy, AfterContentChecked, DoCheck } from '@angular/core';
import { LabelStore } from '../state/labels-state';
import { Observable, Subject } from 'rxjs';
import { Label } from '../models/label';
import { Select, Store } from '@ngxs/store';
import { UpdateLabel, SetDeleteLabel, LoadLabels, AddLabel, PositionLabel } from '../state/labels-actions';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Order, OrderEntity, OrderService } from 'src/app/shared/services/order.service';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllComponent implements OnInit, OnDestroy  {

  public labels: Label[];

  destroy = new Subject<void>();

  constructor(
    public pService: PersonalizationService,
    private store: Store) { }

  async ngOnInit() {

    await this.store.dispatch(new LoadLabels()).toPromise();

    this.store.select(x => x.Labels.labelsAll).pipe(take(1))
    .subscribe(x => { this.labels = [...x]; setTimeout(() => this.initMurri()); });

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());
  }

  initMurri() {
      this.pService.gridSettings();

      this.pService.grid.on('dragEnd', async (item, event) => {
      const order: Order = {
        orderEntity: OrderEntity.Label,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionLabel(false, parseInt(order.entityId, 10), order));
      });
  }

  async update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel('', '#FFEBCD')).toPromise();

    this.store.select(x => x.Labels.labelsAll).pipe(take(1))
    .subscribe(x => {
      this.labels.unshift(x[0]);
      setTimeout(() =>  this.pService.grid.add(document.querySelector('.grid-item'), {index : 0, layout: true}), 0);
    });

  }

  async setDelete(id: number) {
    await this.store.dispatch(new SetDeleteLabel(id)).toPromise();
    this.labels = this.labels.filter(x => x.id !== id);
    setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
