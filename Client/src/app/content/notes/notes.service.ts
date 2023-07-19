import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { NoteEntitiesService } from 'src/app/shared/services/note-entities.service';
import {
  CancelAllSelectedLabels,
  ClearAddToDomNotes,
  LoadNotes,
  SelectAllNote,
  SelectIdsNote,
  UpdateOneNote,
  UpdatePositionsNotes,
} from './state/notes-actions';
import { NoteStore } from './state/notes-state';
import { SmallNote } from './models/small-note.model';
import { DialogsManageService } from '../navigation/services/dialogs-manage.service';
import { ApiServiceNotes } from './api-notes.service';
import { UpdaterEntitiesService } from '../../core/entities-updater.service';
import { NoteComponent } from './note/note.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Injection only in component */
@Injectable()
export class NotesService extends NoteEntitiesService implements OnDestroy {
  viewElements: QueryList<NoteComponent>;

  muurriElements: QueryList<ElementRef>;

  labelsIds: Subscription;

  prevSortedNoteByTypeId: SortedByENUM = null;

  constructor(
    public pService: PersonalizationService,
    store: Store,
    murriService: MurriService,
    router: Router,
    private route: ActivatedRoute,
    dialogsManageService: DialogsManageService,
    apiService: ApiServiceNotes,
    public actions$: Actions,
    private updateService: UpdaterEntitiesService,
  ) {
    super(dialogsManageService, store, murriService, apiService, router);

    this.actions$
      .pipe(ofActionDispatched(SelectAllNote), takeUntil(this.destroy))
      .subscribe(() => {
        const notes = this.getNotesToRender();
        const noteIds = notes.map(x => x.id);
        this.store.dispatch(new SelectIdsNote(noteIds));
      });

    this.store
      .select(NoteStore.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => this.deleteFromDom(x));

    this.store
      .select(NoteStore.getIsCanceled)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x === true) {
          this.resetAndInitLayout();
          this.store.dispatch(new CancelAllSelectedLabels(false));
        }
      });

    this.store
      .select(UserStore.getPersonalizationSettings)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (pr) => {
        if (!pr) return;
        if (this.prevSortedNoteByTypeId && this.prevSortedNoteByTypeId !== pr.sortedNoteByTypeId) {
          this.prevSortedNoteByTypeId = pr.sortedNoteByTypeId;
          this.resetAndInitLayout();
        } else {
          this.prevSortedNoteByTypeId = pr.sortedNoteByTypeId;
        }
      });

    this.store
      .select(NoteStore.notesAddingToDOM)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        const isInnerNote = this.store.selectSnapshot(AppStore.isNoteInner);
        if (x && x.notes?.length > 0 && !isInnerNote) {
          const roadType = this.store.selectSnapshot(AppStore.getTypeNote);
          if (!x.type || x.type === roadType) {
            this.addToDom(x.notes);
            this.store.dispatch(ClearAddToDomNotes);
          }
        }
      });

    this.murriService.dragEnd$.pipe(takeUntilDestroyed()).subscribe(flag => {
      if (flag) {
        this.syncPositions();
      }
    });
  }

  get getNotesByCurrentType() {
    switch (this.store.selectSnapshot(AppStore.getTypeNote)) {
      case NoteTypeENUM.Private: {
        return this.store.selectSnapshot(NoteStore.privateNotes);
      }
      case NoteTypeENUM.Shared: {
        return this.store.selectSnapshot(NoteStore.sharedNotes);
      }
      case NoteTypeENUM.Archive: {
        return this.store.selectSnapshot(NoteStore.archiveNotes);
      }
      case NoteTypeENUM.Deleted: {
        return this.store.selectSnapshot(NoteStore.deletedNotes);
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
  }

  get isSortable() {
    return this.sortNoteType === SortedByENUM.CustomOrder;
  }

  get isFilteredMode() {
    return this.store.selectSnapshot(NoteStore.getSelectedLabelFilter).length > 0;
  }

  get sortNoteType(): SortedByENUM {
    return this.store.selectSnapshot(UserStore.getPersonalizationSettings).sortedNoteByTypeId;
  }

  get pageSortType(): SortedByENUM {
    const isFullFolder = this.store.selectSnapshot(AppStore.isFolderInner);
    if (isFullFolder) {
      return SortedByENUM.DescDate;
    }
    const isSharedType = this.store.selectSnapshot(AppStore.getTypeNote) === NoteTypeENUM.Shared;
    if (isSharedType) {
      return SortedByENUM.DescDate;
    }
    return this.sortNoteType;
  }

  syncPositions(): void {
    if (!this.isNeedUpdatePositions) return;
    const positions = this.murriService.getPositions();
    this.store.dispatch(new UpdatePositionsNotes(positions));
  }

  async resetAndInitLayout(): Promise<void> {
    await this.resetLayoutAsync();
    const entities = this.getNotesToRender();
    this.initContentProgressively(entities);
  }

  getIsDraggable(noteType: NoteTypeENUM) {
    return !this.isFilteredMode && noteType !== NoteTypeENUM.Shared && this.isSortable;
  }

  murriInitialise(): void {
    this.muurriElements.changes
      .pipe(takeUntil(this.destroy))
      .subscribe((q: QueryList<ElementRef>) => this.syncLayoutAsync(q.toArray()));
  }

  async syncLayoutAsync(q: ElementRef[]) {
    const isFirstInit = this.needFirstInit();
    if (isFirstInit) {
      this.initState();
      const ids = this.entities.map(x => x.id);
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      await this.murriService.initMurriNoteAsync(this.getIsDraggable(noteType));
      await this.setFirstInitedMurri();
      this.murriService.layoutEnd$.pipe(take(1)).subscribe(() => this.murriService.setOpacity1());
      this.showItems(ids);
      this.loadNotesWithUpdates();
    }
    const res = await this.synchronizeState(q);
    this.showItems(res.idsToAdd);
  }

  private showItems(ids: string[]): void {
    if (!ids || ids.length === 0) return;
    const itemsToShow = this.entities.filter(x => ids.some(q => q === x.id));
    for (const item of itemsToShow) {
      this.onDisplayItems$.next(item);
    }
  }

  async loadNotesWithUpdates() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.updateService.notesIds$.pipe(takeUntil(this.destroy)).subscribe(async (ids) => {
      if (ids.length > 0) {
        const notes = await this.apiService.getNotesMany(ids, pr).toPromise();
        const actionsForUpdate = notes.map((note) => new UpdateOneNote(note, note.id));
        this.store.dispatch(actionsForUpdate);
        const transformNotes = this.transformSpread(notes);
        transformNotes.forEach((note) => {
          const entity = this.entities.find((x) => x.id === note.id);
          if (entity) {
            entity.contents = note.contents;
          }
          const uiNote = this.viewElements.toArray().find((x) => x.note.id === note.id);
          if (uiNote) {
            uiNote.syncContent();
          }
        });
        super.loadAdditionNoteInformation(ids);
        await this.murriService.refreshLayoutAsync();
        this.updateService.notesIds$.next([]);
      }
    });
  }

  async loadNotes(typeENUM: NoteTypeENUM) {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    await this.store.dispatch(new LoadNotes(typeENUM, pr)).toPromise();
    const types = Object.values(NoteTypeENUM).filter(
      (q) => typeof q === 'number' && q !== typeENUM,
    );
    const actions = types.map((t: NoteTypeENUM) => new LoadNotes(t, pr));
    this.store.dispatch(actions);
  }

  navigateFunc(note: SmallNote) {
    const routing = this.store.selectSnapshot(AppStore.getRouting);
    if (routing === EntityType.FolderInnerNote) {
      return this.router.navigate(['../', note.id], { relativeTo: this.route });
    }
    return this.router.navigate(['/notes/', note.id]);
  }

  toNote(note: SmallNote) {
    super.baseToNote(note, () => this.navigateFunc(note));
  }

  ngOnDestroy(): void {
    console.log('note destroy');
    this.murriService.resetToDefaultOpacity();
    this.destroy.next();
    this.destroy.complete();
    this.labelsIds?.unsubscribe();
  }

  async initializeEntities() {

    const entities = this.getNotesToRender();
    this.initContentProgressively(entities);

    this.labelsIds = this.store
      .select(NoteStore.getSelectedLabelFilter)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {
        if (x) {
          await this.updateLabelSelected(x);
        }
      });

    await super.loadAdditionNoteInformation();
  }

  getNotesToRender(): SmallNote[] {
    let tempNotes = this.transformSpread(this.getNotesByCurrentType);
    tempNotes = this.orderBy(tempNotes, this.pageSortType);

    if (!this.isFilteredMode) {
      return tempNotes;
    }

    const ids = this.store.selectSnapshot(NoteStore.getSelectedLabelFilter);
    return tempNotes.filter((x) =>
      x.labels.some((label) => ids.some((q) => q === label.id)),
    );
  }

  async updateLabelSelected(ids: string[]) {
    if (ids.length !== 0) {
      await this.resetAndInitLayout();
    }
  }

  loadNoteAndAddToDom(notes: SmallNote[]) {
    if (notes && notes.length > 0) {
      const m = notes.map((x) => ({ ...x }));
      this.entities.unshift(...m);
    }
  }
}
