import { Injectable } from '@angular/core';
import { PersonalizationService } from './personalization.service';
import { Store } from '@ngxs/store';
import { Order, OrderEntity } from './order.service';
import { PositionNote } from 'src/app/content/notes/state/notes-actions';
import { PositionFolder } from 'src/app/content/folders/state/folders-actions';
import { PositionLabel } from 'src/app/content/labels/state/labels-actions';
import * as Muuri from 'muuri';
import { NoteType } from '../enums/NoteTypes';
import { FolderType } from '../enums/FolderTypes';

@Injectable()
export class MurriService  {

  gridItemName = '.grid-item';

  grid;
  public flagForOpacity = false;

  constructor(private store: Store,
              private pService: PersonalizationService) {

    pService.changeOrientationSubject.subscribe(z => {
      setTimeout(() => this.grid.refreshItems().layout(), 0);
    });
  }

  setOpacityTrueAsync(delayOpacity: number = 50, flag = true) {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => {
      this.flagForOpacity = flag;
      resolve(true);
    }, delayOpacity
    ));
  }

  wait(delay: number = 0) {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => {
      resolve(true);
    }, delay
    ));
  }

  refreshLayoutAsync() {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => {
      this.grid?.refreshItems().layout();
      resolve(true);
    }
    ));
  }

  initMurriNoteAsync(type: NoteType, isDragEnabled: boolean) {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => {
      this.initMurriNote(type, isDragEnabled);
      resolve(true);
    }
    ));
  }

  initMurriNote(type: NoteType, isDragEnabled: boolean) {
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(this.gridItemName, gridElement, isDragEnabled);
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

  initMurriFolder(type: FolderType) {
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(this.gridItemName, gridElement, true);
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
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(this.gridItemName, gridElement, true);
    this.grid.on('dragEnd', async (item, event) => {
      const order: Order = {
        orderEntity: OrderEntity.Label,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionLabel(deleted, parseInt(order.entityId, 10), order));
    });
  }

  gridSettings(element: string, gridElement: HTMLElement, isDragEnabled: boolean) {
    const dragHelper = document.querySelector('.drag-helper') as HTMLElement;
    this.grid = new Muuri.default(gridElement, {
      items: element,
      dragEnabled: isDragEnabled,
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
        if (e.deltaTime > 300 && e.distance <= 30) {
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
          { element: document.querySelector('.scroll-helper .ng-native-scrollbar-hider') as HTMLElement, priority: 1, axis: 2 },
        ],
        sortDuringScroll: false,
        smoothStop: true,
        safeZone: 0.1
      }
    });
    this.grid.layout((items, hasLayoutChanged) => {
      console.log('layout done!');
    });
  }

  muuriDestroy(flag: boolean = false) {
    if (this.grid) {
      this.grid.destroy(flag);
    }
  }
}
