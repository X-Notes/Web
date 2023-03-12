import { ElementRef, Injectable, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, Store } from '@ngxs/store';
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

@Injectable()
export class FullFolderNotesService extends NoteEntitiesService {
  folderId: string;

  constructor(
    store: Store,
    murriService: MurriService,
    apiNoteService: ApiServiceNotes,
    private apiFullFolder: ApiFullFolderService,
    dialogsManageService: DialogsManageService,
    private route: ActivatedRoute,
    router: Router,
    actions: Actions,
  ) {
    super(dialogsManageService, store, murriService, apiNoteService, router, actions, null);
  }

  onDestroy(): void {
    console.log('full folder notes destroy');
    this.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  async initializeEntities(notes: SmallNote[], folderId: string) {
    this.initializeEntitiesGeneric(notes, folderId);
    await this.loadAdditionNoteInformation();
  }

  async initializePublicEntities(notes: SmallNote[], folderId: string) {
    this.initializeEntitiesGeneric(notes, folderId);
  }

  murriInitialize(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (this.getIsFirstInit(z)) {
        await this.murriService.initFolderNotesAsync();
        await this.setInitMurriFlagShowLayout();
      }
      await this.synchronizeState(refElements, false);
    });
  }

  async handlerUpdates(updates: UpdateFolderWS) {
    if (!updates) return;
    if (updates.idsToRemove?.length > 0) {
      this.deleteFromDom(updates.idsToRemove);
    }
    await this.handleAdding(updates.idsToAdd);
  }

  async handleAdding(idsToAdd: string[]) {
    if (idsToAdd && idsToAdd.length > 0) {
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const newNotes = await this.apiFullFolder
        .getFolderNotes(this.folderId, pr, idsToAdd)
        .toPromise();
      const isAdded = this.addToDom(newNotes);
      if (isAdded) {
        this.updateOrder();
      }
    }
  }

  updatePositions() {}

  updateOrder(): void {
    const sorted = this.entities.sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );
    let order = 1;
    sorted.forEach((item) => (item.order = order++));
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
    tempNotes = this.orderBy(tempNotes, SortedByENUM.DescDate);

    this.entities = tempNotes;

    this.initState();
  }
}
