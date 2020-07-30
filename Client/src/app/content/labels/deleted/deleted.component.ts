import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';
import { Label } from '../models/label';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UpdateLabel, SetDeleteLabel, LoadLabels, DeleteLabel } from '../state/labels-actions';
import { Order, OrderEntity, OrderService } from 'src/app/shared/services/order.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss']
})
export class DeletedComponent implements OnInit {

  public labels: Label[];

  constructor(public pService: PersonalizationService,
              private store: Store,
              private orderService: OrderService) { }

  async ngOnInit() {

    await this.store.dispatch(new LoadLabels()).toPromise();

    this.store.select(x => x.Labels.labelsDeleted).pipe(take(1))
    .subscribe(x => { this.labels = [...x]; setTimeout(() => this.initMurri()); });
  }

  initMurri() {
    this.pService.gridSettings();

    this.pService.grid.on('dragEnd', async (item, event) => {
    const order: Order = {
      orderEntity: OrderEntity.Label,
      position: item.getGrid().getItems().indexOf(item) + 1,
      entityId: item._element.id
    };
    await this.orderService.changeOrder(order).toPromise();
    });
}


  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  async delete(id: number) {
    await this.store.dispatch(new DeleteLabel(id)).toPromise();
    this.labels = this.labels.filter(x => x.id !== id);
    setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
  }

}
