/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-dupe-class-members */
/* eslint-disable no-underscore-dangle */
import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  UpdatePositionsNotes,
  UpdatePositionsRelatedNotes,
} from 'src/app/content/notes/state/notes-actions';
import { UpdatePositionsFolders } from 'src/app/content/folders/state/folders-actions';
import { UpdatePositionsLabels } from 'src/app/content/labels/state/labels-actions';
import * as Muuri from 'muuri';
import { PersonalizationService } from './personalization.service';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Injectable()
export class MurriService implements OnDestroy {
  layoutEnd$: Subject<boolean> = new Subject<boolean>();

  destroy$: Subject<boolean> = new Subject<boolean>();

  private layoutUpdate$: Subject<number> = new Subject<number>();

  private _flagForOpacity = false;

  private grid: any;

  constructor(private store: Store, private pService: PersonalizationService) {
    this.pService.changeOrientationSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
      setTimeout(() => this.refreshAndLayout());
    });
    this.layoutUpdate$.pipe(takeUntil(this.destroy$), debounceTime(50)).subscribe((x: number) =>
      setTimeout(() => {
        this._flagForOpacity = true;
      }, x),
    );
  }

  get flagForOpacity(): boolean {
    return this._flagForOpacity;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      throw new Error('gridElement == null');
    }
    this.gridSettings(gridItemName, gridElement, false);
    this.grid.on('layoutEnd', async () => {
      this.layoutEnd$.next(true);
    });
  }

  /// SIDE BAR

  initSidebarNotesAsync(noteId: string, delay = 0) {
    return new Promise<boolean>((resolve) =>
      setTimeout(async () => {
        this.initSidebarNotes(noteId);
        resolve(true);
      }, delay),
    );
  }

  initSidebarNotes(noteId: string) {
    const gridItemName = '.grid-item-small';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      throw new Error('gridElement == null');
    }

    this.gridSettings(gridItemName, gridElement, true);
    this.grid.on('dragEnd', async () => {
      // eslint-disable-next-line no-underscore-dangle
      this.store.dispatch(new UpdatePositionsRelatedNotes(this.getPositions(), noteId));
    });
    this.grid.on('layoutEnd', async () => {
      this.layoutEnd$.next(true);
    });
  }

  /// NOTE MURRI

  initMurriNoteAsync(isDragEnabled: boolean) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.initMurriNote(isDragEnabled);
        resolve(true);
      }),
    );
  }

  getPositions(): PositionEntityModel[] {
    return this.grid.getItems().map((el: any, index: number) => {
      return { entityId: el._element.id, position: index + 1 } as PositionEntityModel;
    });
  }

  sortByHtml(attribute = 'order') {
    if (!this.grid) return;
    this.grid.sort((itemA: any, itemB: any) => {
      const aId = parseInt(itemA.getElement().getAttribute(attribute), 10);
      const bId = parseInt(itemB.getElement().getAttribute(attribute), 10);
      return aId - bId;
    });
  }

  initMurriNote(isDragEnabled: boolean) {
    const gridItemName = '.grid-item'; // TODO move to const
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      throw new Error('gridElement == null');
    }

    this.gridSettings(gridItemName, gridElement, isDragEnabled);
    this.grid.on('dragEnd', async () => {
      this.store.dispatch(new UpdatePositionsNotes(this.getPositions()));
    });
    this.grid.on('layoutEnd', async () => {
      this.layoutEnd$.next(true);
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
      throw new Error('gridElement == null');
    }
    this.gridSettings(gridItem, gridElement, false);
    this.grid.on('layoutEnd', async () => {
      this.layoutEnd$.next(true);
    });
  }

  /// ///////////////////////////////////

  /// FOLDERS

  initMurriFolderAsync(isDragEnabled: boolean) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.initMurriFolder(isDragEnabled);
        resolve(true);
      }),
    );
  }

  initMurriFolder(isDragEnabled = true) {
    const gridItemName = '.grid-item';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      throw new Error('gridElement == null');
    }

    this.gridSettings(gridItemName, gridElement, isDragEnabled);
    this.grid.on('dragEnd', async () => {
      this.store.dispatch(new UpdatePositionsFolders(this.getPositions()));
    });
    this.grid.on('layoutEnd', async () => {
      this.layoutEnd$.next(true);
    });
  }
  /// ////////////////////////////////

  /// LABELS
  initMurriLabel() {
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      throw new Error('gridElement == null');
    }
    const gridItemName = '.grid-item';
    this.gridSettings(gridItemName, gridElement, true);
    this.grid.on('dragEnd', async () => {
      this.store.dispatch(new UpdatePositionsLabels(this.getPositions()));
    });
    this.grid.on('layoutEnd', async () => {
      this.layoutEnd$.next(true);
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
        rounding: false,
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.grid.layout(() => {});
  }

  setOpacityFlagAsync(time = 0): void {
    this.layoutUpdate$.next(time);
  }

  refreshLayoutAsync() {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.refreshAndLayout();
        resolve(true);
      }),
    );
  }

  refreshAndLayout(): void {
    this.grid.refreshItems().layout();
  }

  async muuriDestroyAsync(waitLayoutDestroy = 100) {
    this.resetToDefaultOpacity();
    await this.wait(waitLayoutDestroy);
    if (this.grid) {
      const removeElementsInDom = false; // should be changed only if angular renderer cannot delete;
      this.grid.destroy(removeElementsInDom);
    }
  }

  wait = (delay = 0) => {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        resolve(true);
      }, delay),
    );
  };

  resetToDefaultOpacity(): void {
    this._flagForOpacity = false;
  }

  setOpacity1(): void {
    this._flagForOpacity = true;
  }

  addElement(elements: HTMLElement[], isAddToEnd: boolean, layout: boolean): void {
    this.grid.add(elements, {
      index: isAddToEnd ? -1 : 0,
      layout,
    });
  }

  removeElements(items: any[], removeElements: boolean): void {
    this.grid.remove(items, { removeElements });
  }

  getItems(): any[] {
    return this.grid.getItems();
  }
}
