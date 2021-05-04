/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { PositionNote } from 'src/app/content/notes/state/notes-actions';
import { PositionFolder } from 'src/app/content/folders/state/folders-actions';
import { PositionLabel } from 'src/app/content/labels/state/labels-actions';
import * as Muuri from 'muuri';
import { ApiRelatedNotesService } from 'src/app/content/notes/api-related-notes.service';
import { Order, OrderEntity } from './order.service';
import { PersonalizationService } from './personalization.service';
import { NoteType } from '../models/noteType';
import { FolderType } from '../models/folderType';

@Injectable()
export class MurriService {
  // TODO REFACTOR SERVICE
  grid;

  public flagForOpacity = false;

  constructor(private store: Store, private pService: PersonalizationService) {
    this.pService.changeOrientationSubject.subscribe(() => {
      setTimeout(() => this.grid.refreshItems().layout(), 0);
    });
  }

  /// FOLDER NOTES

  initFolderNotesAsync(delay = 0) {
    return new Promise<boolean>((resolve) =>
      setTimeout(async () => {
        this.initFolderNotes();
        resolve(true);
      }, delay),
    );
  }

  initFolderNotes() {
    const gridItemName = '.grid-item';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }
    this.gridSettings(gridItemName, gridElement, true);
  }

  /// SIDE BAR

  initSidebarNotesAsync(apiRelatedNotes: ApiRelatedNotesService, noteId: string, delay = 0) {
    return new Promise<boolean>((resolve) =>
      setTimeout(async () => {
        this.initSidebarNotes(apiRelatedNotes, noteId);
        resolve(true);
      }, delay),
    );
  }

  initSidebarNotes(apiRelatedNotes: ApiRelatedNotesService, noteId: string) {
    const gridItemName = '.grid-item-small';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(gridItemName, gridElement, true);
    this.grid.on('dragEnd', async (item) => {
      // eslint-disable-next-line no-underscore-dangle
      const index = item.getGrid().getItems().indexOf(item);
      if (index === 0) {
        await apiRelatedNotes.updateOrder(noteId, item._element.id, null).toPromise();
      } else {
        const prevId = item.getGrid().getItem(index - 1)._element.id;
        await apiRelatedNotes.updateOrder(noteId, item._element.id, prevId).toPromise();
      }
    });
  }

  /// NOTE MURRI

  initMurriNoteAsync(type: NoteType, isDragEnabled: boolean) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.initMurriNote(type, isDragEnabled);
        resolve(true);
      }),
    );
  }

  initMurriNote(type: NoteType, isDragEnabled: boolean) {
    const gridItemName = '.grid-item';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(gridItemName, gridElement, isDragEnabled);
    this.grid.on('dragEnd', async (item) => {
      // eslint-disable-next-line no-underscore-dangle
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        // eslint-disable-next-line no-underscore-dangle
        entityId: item._element.id,
      };
      this.store.dispatch(new PositionNote(order, type));
    });
  }

  /// ////////////////////////////////

  // Preview Modal
  initMurriPreviewDialogNoteAsync(delay = 0) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.initMurriPreviewDialogNote();
        resolve(true);
      }, delay),
    );
  }

  initMurriPreviewDialogNote() {
    const gridItem = '.grid-modal-item';
    const gridElement = document.querySelector('.grid-modal') as HTMLElement;
    if (!gridElement) {
      return;
    }
    this.gridSettings(gridItem, gridElement, false);
  }

  /// ///////////////////////////////////

  /// FOLDERS
  initMurriFolder(type: FolderType, isDragEnabled: boolean = true) {
    const gridItemName = '.grid-item';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(gridItemName, gridElement, isDragEnabled);
    this.grid.on('dragEnd', async (item) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Folder,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id,
      };
      this.store.dispatch(new PositionFolder(order, type));
    });
  }
  /// ////////////////////////////////

  /// LABELS
  initMurriLabel(deleted: boolean) {
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }
    const gridItemName = '.grid-item';
    this.gridSettings(gridItemName, gridElement, true);
    this.grid.on('dragEnd', async (item) => {
      const order: Order = {
        orderEntity: OrderEntity.Label,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id,
      };
      this.store.dispatch(new PositionLabel(deleted, order.entityId, order));
    });
  }

  /// ////////////////////////////////

  /// DEFAULT MURRI
  gridSettings(element: string, gridElement: HTMLElement, isDragEnabled: boolean) {
    const dragHelper = document.querySelector('.drag-helper') as HTMLElement;
    // eslint-disable-next-line new-cap
    this.grid = new Muuri.default(gridElement, {
      items: element,
      dragEnabled: isDragEnabled,
      layout: {
        fillGaps: false,
        horizontal: false,
        alignRight: false,
        alignBottom: false,
        rounding: true,
      },
      dragContainer: dragHelper,
      dragRelease: {
        useDragContainer: false,
      },
      dragCssProps: {
        touchAction: 'auto',
      },
      // eslint-disable-next-line consistent-return
      dragStartPredicate: (item, e) => {
        if (e.deltaTime > 300 && e.distance <= 30) {
          return true;
        }
      },
      dragPlaceholder: {
        enabled: true,
        createElement: (item: any) => {
          return item.getElement().cloneNode(true);
        },
      },
      dragAutoScroll: {
        targets: [
          { element: window, priority: -1 },
          {
            element: document.querySelector(
              '.scroll-helper .ng-native-scrollbar-hider',
            ) as HTMLElement,
            priority: 1,
            axis: 2,
          },
        ],
        sortDuringScroll: false,
        smoothStop: true,
        safeZone: 0.1,
      },
    });
    this.grid.layout(() => {
      console.log('layout done!');
    });
  }

  setOpacityFlagAsync(delayOpacity: number = 50, flag = true) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.flagForOpacity = flag;
        resolve(true);
      }, delayOpacity),
    );
  }

  wait = (delay: number = 0) => {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        resolve(true);
      }, delay),
    );
  };

  refreshLayoutAsync() {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.grid?.refreshItems().layout();
        resolve(true);
      }),
    );
  }

  muuriDestroy(flag: boolean = false) {
    if (this.grid) {
      this.grid.destroy(flag);
    }
  }
}
