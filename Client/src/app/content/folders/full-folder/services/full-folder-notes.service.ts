import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { UpdateNoteUI } from 'src/app/content/notes/state/update-note-ui.model';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { IMurriEntityService } from 'src/app/shared/services/murri-entity.contract';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NoteEntitiesService } from 'src/app/shared/services/note-entities.service';
import { ApiFullFolderService } from './api-full-folder.service';

@Injectable()
export class FullFolderNotesService
  extends NoteEntitiesService
  implements OnDestroy, IMurriEntityService<SmallNote, NoteTypeENUM> {
  constructor(
    store: Store,
    murriService: MurriService,
    apiNoteService: ApiServiceNotes,
    private apiFullFolder: ApiFullFolderService,
    dialogsManageService: DialogsManageService,
    private route: ActivatedRoute,
    private router: Router,
    private updateService: UpdaterEntitiesService,
  ) {
    super(dialogsManageService, store, murriService, apiNoteService);
  }

  ngOnDestroy(): void {
    console.log('full folder notes destroy');
    super.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  async initializeEntities(notes: SmallNote[]) {
    let tempNotes = this.transformSpread(notes);
    tempNotes = this.orderBy(tempNotes, SortedByENUM.DescDate);

    this.entities = tempNotes;

    super.initState();

    await super.loadAdditionNoteInformation();
  }

  async updateNotesLayout(folderId: string) {
    await this.destroyGridAsync();
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.entities = await this.apiFullFolder.getFolderNotes(folderId, pr).toPromise();
    await this.murriService.initFolderNotesAsync();
    await this.murriService.setOpacityFlagAsync();
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (this.getIsFirstInit(z)) {
        await this.murriService.initFolderNotesAsync();
        await this.setInitMurriFlagShowLayout();
        this.updateUpdatesSubs();
      }
      await this.synchronizeState(refElements, false);
    });
  }

  updateUpdatesSubs() {
    this.updateService.updateNotesInFolder$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (values: UpdateNoteUI[]) => {
        if (values && values.length > 0) {
          await this.updateNotes(values);
          this.updateService.updateNotesInFolder$.next([]);
        }
      });
  }

  navigateFunc(note: SmallNote) {
    return this.router.navigate([note.id], { relativeTo: this.route });
  }

  toNote(note: SmallNote) {
    super.baseToNote(note, () => this.navigateFunc(note));
  }
}
