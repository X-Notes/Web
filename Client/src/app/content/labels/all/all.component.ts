import { Component, OnInit } from '@angular/core';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';
import { Label } from '../models/label';
import { Select, Store } from '@ngxs/store';
import { UpdateLabel, SetDeleteLabel, LoadLabels } from '../state/labels-actions';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Order, OrderEntity, OrderService } from 'src/app/shared/services/order.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllComponent implements OnInit {

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private orderService: OrderService) { }

  async ngOnInit() {

    await this.store.dispatch(new LoadLabels()).toPromise();

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
    await this.store.dispatch(new SetDeleteLabel(id)).toPromise();
    this.pService.grid.refreshItems().layout();
  }

}
