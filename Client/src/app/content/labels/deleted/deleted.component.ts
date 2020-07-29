import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';
import { Label } from '../models/label';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UpdateLabel, SetDeleteLabel, LoadLabels, DeleteLabel } from '../state/labels-actions';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss']
})
export class DeletedComponent implements OnInit {

  @Select(LabelStore.deleted)
  public labels$: Observable<Label[]>;
  orderService: any;

  constructor(public pService: PersonalizationService,
              private store: Store) { }

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
    await this.store.dispatch(new DeleteLabel(id)).toPromise();
    this.pService.grid.refreshItems().layout();
  }

}
