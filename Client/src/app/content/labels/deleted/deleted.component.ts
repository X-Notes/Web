import { Component, OnInit, OnDestroy } from '@angular/core';
import {  Store } from '@ngxs/store';
import { Label } from '../models/label';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UpdateLabel, LoadLabels, DeleteLabel, PositionLabel } from '../state/labels-actions';
import { Order, OrderEntity, OrderService } from 'src/app/shared/services/order.service';
import { take, takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Subject } from 'rxjs';
import {UpdateRoute, UpdateSettingsButton, UpdateNewButton, UpdateSelectAllButton } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';


@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss']
})
export class DeletedComponent implements OnInit, OnDestroy {

  public labels: Label[];
  destroy = new Subject<void>();

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {

     await this.store.dispatch(new UpdateRoute(EntityType.LabelDeleted)).toPromise();

     this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );

  }

  async loadContent() {
    await this.store.dispatch(new LoadLabels()).toPromise();

    this.store.select(x => x.Labels.labelsDeleted).pipe(take(1))
    .subscribe(x => { this.labels = x; setTimeout(() => this.initMurri()); });
  }

  initMurri() {
    this.pService.gridSettings('.grid-item');

    this.pService.grid.on('dragEnd', async (item, event) => {
    const order: Order = {
      orderEntity: OrderEntity.Label,
      position: item.getGrid().getItems().indexOf(item) + 1,
      entityId: item._element.id
    };
    this.store.dispatch(new PositionLabel(true, parseInt(order.entityId, 10), order));
    });
}


  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  restoreLabel(id: number) {
    this.labels = this.labels.filter(x => x.id !== id);
    setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
  }

  async delete(id: number) {
    await this.store.dispatch(new DeleteLabel(id)).toPromise();
    this.labels = this.labels.filter(x => x.id !== id);
    setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
  }

}
