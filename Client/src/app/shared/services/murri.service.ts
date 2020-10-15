import { Injectable, OnDestroy } from '@angular/core';
import { PersonalizationService } from './personalization.service';
import { Store } from '@ngxs/store';
import { Order, OrderEntity } from './order.service';
import { PositionNote } from 'src/app/content/notes/state/notes-actions';
import { EntityType } from '../enums/EntityTypes';
import { PositionFolder } from 'src/app/content/folders/state/folders-actions';
import { PositionLabel } from 'src/app/content/labels/state/labels-actions';
import * as Muuri from 'muuri';

@Injectable()
export class MurriService {

  grid;
  public delayForOpacity = 0;
  public flagForOpacity = false;

  constructor(private store: Store) {
                console.log(555);
               }


  initMurriNote(type: EntityType) {
    this.gridSettings('.grid-item');
    this.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionNote(order, type));
    });
  }

  initMurriFolder(type: EntityType) {
    this.gridSettings('.grid-item');
    this.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Folder,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionFolder(order, type));
    });
  }

  initMurriLabel(deleted: boolean) {
    this.gridSettings('.grid-item');
    this.grid.on('dragEnd', async (item, event) => {
      const order: Order = {
        orderEntity: OrderEntity.Label,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionLabel(deleted, parseInt(order.entityId, 10), order));
    });
  }

  gridSettings(element: string) {
    const dragHelper = document.querySelector('.drag-helper') as HTMLElement;
    console.log(dragHelper);
    this.grid = new Muuri.default('.grid', {
      items: element,
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
        if ( e.deltaTime > 300 && e.distance <= 30) {
          return true;
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
          { element: document.querySelector('.autoscroll-helper .simplebar-content-wrapper') as HTMLElement, priority: 1, axis: 2 },
        ],
        sortDuringScroll: false,
        smoothStop: true,
        safeZone: 0.1
      }
    });
    setTimeout(() => this.flagForOpacity = true, this.delayForOpacity);
  }

  muuriDestroy() {
    this.grid.destroy(true);
  }
}
