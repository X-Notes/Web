/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  UpdatePositionsNotes,
  UpdatePositionsRelatedNotes,
} from 'src/app/content/notes/state/notes-actions';
import { UpdatePositionsFolders } from 'src/app/content/folders/state/folders-actions';
import { UpdatePositionsLabels } from 'src/app/content/labels/state/labels-actions';
import * as Muuri from 'muuri';
import { PersonalizationService } from './personalization.service';
import { FolderTypeENUM } from '../enums/folder-types.enum';
import { NoteTypeENUM } from '../enums/note-types.enum';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';

@Injectable()
export class MurriService {
  // TODO REFACTOR SERVICE
  grid; // TODO HIDE GRID

  public flagForOpacity = false;

  constructor(private store: Store, private pService: PersonalizationService) {
    this.pService.changeOrientationSubject.subscribe(() => {
      setTimeout(() => this.grid?.refreshItems().layout());
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
    this.gridSettings(gridItemName, gridElement, false);
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
      return;
    }

    this.gridSettings(gridItemName, gridElement, true);
    this.grid.on('dragEnd', async () => {
      // eslint-disable-next-line no-underscore-dangle
      this.store.dispatch(new UpdatePositionsRelatedNotes(this.getPositions(), noteId));
    });
  }

  /// NOTE MURRI

  initMurriNoteAsync(type: NoteTypeENUM, isDragEnabled: boolean) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.initMurriNote(type, isDragEnabled);
        resolve(true);
      }),
    );
  }

  getPositions(): PositionEntityModel[] {
    return this.grid.getItems().map((el, index) => {
      return { entityId: el._element.id, position: index + 1 } as PositionEntityModel;
    });
  }

  initMurriNote(type: NoteTypeENUM, isDragEnabled: boolean) {
    const gridItemName = '.grid-item'; // TODO move to const
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(gridItemName, gridElement, isDragEnabled);
    this.grid.on('dragEnd', async () => {
      this.store.dispatch(new UpdatePositionsNotes(this.getPositions()));
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

  initMurriFolderAsync(type: FolderTypeENUM, isDragEnabled: boolean) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        this.initMurriFolder(type, isDragEnabled);
        resolve(true);
      }),
    );
  }

  initMurriFolder(type: FolderTypeENUM, isDragEnabled: boolean = true) {
    const gridItemName = '.grid-item';
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }

    this.gridSettings(gridItemName, gridElement, isDragEnabled);
    this.grid.on('dragEnd', async () => {
      this.store.dispatch(new UpdatePositionsFolders(this.getPositions()));
    });
  }
  /// ////////////////////////////////

  /// LABELS
  initMurriLabel() {
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      return;
    }
    const gridItemName = '.grid-item';
    this.gridSettings(gridItemName, gridElement, true);
    this.grid.on('dragEnd', async () => {
      this.store.dispatch(new UpdatePositionsLabels(this.getPositions()));
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
