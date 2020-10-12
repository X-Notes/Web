import { Injectable } from '@angular/core';
import { PersonalizationService } from './personalization.service';
import { Store } from '@ngxs/store';
import { Order, OrderEntity } from './order.service';
import { PositionNote } from 'src/app/content/notes/state/notes-actions';
import { EntityType } from '../enums/EntityTypes';
import { PositionFolder } from 'src/app/content/folders/state/folders-actions';
import { PositionLabel } from 'src/app/content/labels/state/labels-actions';

@Injectable()
export class MurriService {

  public delayForOpacity = 20;
  public flagForOpacity = false;

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  initMurriNote(type: EntityType) {
    this.pService.gridSettings('.grid-item');
    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionNote(order, type));
    });
    setTimeout(() => this.flagForOpacity = true, this.delayForOpacity);
  }

  initMurriFolder(type: EntityType) {
    this.pService.gridSettings('.grid-item');
    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Folder,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionFolder(order, type));
    });
    setTimeout(() => this.flagForOpacity = true, this.delayForOpacity);
  }

  initMurriLabel(deleted: boolean) {
    this.pService.gridSettings('.grid-item');
    this.pService.grid.on('dragEnd', async (item, event) => {
      const order: Order = {
        orderEntity: OrderEntity.Label,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionLabel(deleted, parseInt(order.entityId, 10), order));
    });
    setTimeout(() => this.flagForOpacity = true, this.delayForOpacity);
  }

}
