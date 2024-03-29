import { ElementRef, Injectable, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { UpdateFolderWS } from 'src/app/core/models/signal-r/update-folder-ws';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NoteEntitiesService } from 'src/app/shared/services/note-entities.service';
import { ApiFullFolderService } from './api-full-folder.service';
import { SignalRService } from 'src/app/core/signal-r.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SetFolderNotes, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';

@Injectable()
export class FullFolderNotesService extends NoteEntitiesService {
  folderId?: string;

  constructor(
    store: Store,
    murriService: MurriService,
    apiNoteService: ApiServiceNotes,
    private apiFullFolder: ApiFullFolderService,
    private route: ActivatedRoute,
    router: Router,
    public signalR: SignalRService,
    public readonly pService: PersonalizationService,
  ) {
    super(store, murriService, apiNoteService, router);

    // WS UPDATES
    this.signalR.updateFolder$.pipe(takeUntil(this.destroy)).subscribe(async (x) => {
      await this.handlerUpdates(x);
      this.updateState();
    });
  }

  updateState(): void {
    const isHasEntities = this.entities?.length > 0;
    this.pService.isInnerFolderSelectAllActive$.next(isHasEntities);
    const mappedNotes = this.entities.map((x) => ({ ...x }));
    this.store.dispatch(new SetFolderNotes(mappedNotes));
  }

  onDestroy(): void {
    this.murriService.resetToDefaultOpacity();
    this.destroy.next();
    this.destroy.complete();
  }

  async initializeEntities(notes: SmallNote[], folderId: string) {
    this.initializeEntitiesGeneric(notes, folderId);
    this.loadAdditionNoteInformation();
  }

  async initializePublicEntities(notes: SmallNote[], folderId: string) {
    this.initializeEntitiesGeneric(notes, folderId);
  }

  murriInitialize(refElements?: QueryList<ElementRef>) {
    refElements?.changes.pipe(takeUntil(this.destroy)).subscribe(async () => {
      if (this.needFirstInit()) {
        this.initState();
        await this.murriService.initFolderNotesAsync();
        this.setFirstInitedMurri();
      }
      await this.synchronizeState(refElements.toArray());
    });
    this.murriService.layoutEnd$.pipe(takeUntil(this.destroy)).subscribe(async (q) => {
      if (q) {
        this.murriService.setOpacity1();
      }
    });
  }

  async handlerUpdates(updates: UpdateFolderWS) {
    if (!updates) return;
    if (updates.idsToRemove?.length > 0) {
      this.store.dispatch(UnSelectAllNote);
      this.deleteFromDom(updates.idsToRemove);
    }
    await this.handleAdding(updates.idsToAdd);
  }

  async handleAdding(idsToAdd: string[]) {
    if (this.folderId && idsToAdd && idsToAdd.length > 0) {
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const newNotes = await this.apiFullFolder
        .getFolderNotes(this.folderId, pr.contentInNoteCount, idsToAdd)
        .toPromise();
      const isAdded = this.addToDom(newNotes);
      if (isAdded) {
        this.updateOrder();
      }
    }
  }

  async syncPositions() {
    if (!this.folderId) return;
    if (!this.isNeedUpdatePositions) return;
    const positions = this.murriService.getPositions();
    await this.apiFullFolder.orderNotesInFolder(positions, this.folderId, this.signalR.connectionIdOrError).toPromise();
  }

  updateOrder(): void {
    setTimeout(() => this.murriService.sortByHtml(), 100);
  }

  navigateFunc(note: SmallNote) {
    return this.router.navigate([note.id], { relativeTo: this.route });
  }

  toNote(note: SmallNote) {
    this.baseToNote(note, () => this.navigateFunc(note));
  }

  private async initializeEntitiesGeneric(notes: SmallNote[], folderId: string) {
    this.folderId = folderId;
    let tempNotes = this.transformSpread(notes);
    tempNotes = this.orderBy(tempNotes, SortedByENUM.CustomOrder);

    this.entities = tempNotes;
  }
}
