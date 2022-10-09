import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { ApiFullFolderService } from '../../../../content/folders/full-folder/services/api-full-folder.service';
import { FullFolderNotesService } from '../../../../content/folders/full-folder/services/full-folder-notes.service';
import { FullFolder } from '../../../../content/folders/models/full-folder.model';
import { LoadFullFolder } from '../../../../content/folders/state/folders-actions';
import { FolderStore } from '../../../../content/folders/state/folders-state';
import { SetFolderNotes } from '../../../../content/notes/state/notes-actions';
import { SignalRService } from '../../../../core/signal-r.service';
import { EntitiesSizeENUM } from '../../../../shared/enums/font-size.enum';
import { PersonalizationService } from '../../../../shared/services/personalization.service';
import { OnDestroy } from '@angular/core';
import { SmallNote } from '../../../../content/notes/models/small-note.model';
import { PublicUser } from '../../../storage/public-action';
import { PublicStore } from '../../../storage/public-state';
import { ShortUserPublic } from '../../../interfaces/short-user-public.model';
import { UpdaterEntitiesService } from '../../../../core/entities-updater.service';

@Component({
  selector: 'app-public-folder-content',
  templateUrl: './public-folder-content.component.html',
  styleUrls: ['./public-folder-content.component.scss'],
  providers: [FullFolderNotesService],
})
export class PublicFolderContentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(FolderStore.full)
  folder$: Observable<FullFolder>;

  @Select(PublicStore.owner)
  owner$: Observable<ShortUserPublic>;

  fontSize = EntitiesSizeENUM;

  loaded = false;

  private routeSubscription: Subscription;

  private folderId: string;

  constructor(
    private readonly route: ActivatedRoute,
    public readonly pService: PersonalizationService,
    public readonly ffnService: FullFolderNotesService,
    private readonly store: Store,
    private readonly apiFullFolder: ApiFullFolderService,
    private readonly signalR: SignalRService,
    private readonly router: Router,
    private readonly updateNoteService: UpdaterEntitiesService,
  ) {}

  ngOnInit(): void {
    this.pService.setSpinnerState(true);

    this.routeSubscription = this.route.params.subscribe(async (params) => {
      // REINIT LAYOUT
      let isReinit = false;
      if (this.folderId) {
        await this.ffnService.murriService.destroyGridAsync();
        isReinit = true;
      }
      // lOAD FOLDER
      this.folderId = params.id;
      await this.store.dispatch(new LoadFullFolder(this.folderId)).toPromise();
      const folder = this.store.selectSnapshot(FolderStore.full);
      if (folder) {
        const ownerId = this.store.selectSnapshot(FolderStore.getOwnerId);
        await this.store.dispatch(new PublicUser(ownerId)).toPromise();

        // INIT FOLDER NOTES
        const notes = await this.apiFullFolder.getFolderNotes(this.folderId).toPromise();
        await this.ffnService.initializeEntities(notes, this.folderId);
        this.updateState();

        if (isReinit) {
          await this.ffnService.murriService.initFolderNotesAsync();
          await this.ffnService.murriService.setOpacityFlagAsync(0);
        }
      }

      await this.pService.waitPreloading();
      this.pService.setSpinnerState(false);
      this.loaded = true;
    });
  }

  ngAfterViewInit(): void {
    this.ffnService.murriInitialize(this.refElements);
  }

  ngOnDestroy(): void {
    this.ffnService.onDestroy();
    this.updateNoteService.addFolderToUpdate(this.folderId);
    this.routeSubscription.unsubscribe();
  }

  updateState(): void {
    const isHasEntities = this.ffnService.entities?.length > 0;
    this.pService.isInnerFolderSelectAllActive$.next(isHasEntities);
    const mappedNotes = this.ffnService.entities.map((x) => ({ ...x }));
    this.store.dispatch(new SetFolderNotes(mappedNotes));
  }

  toPublicNote(note: SmallNote) {
    this.ffnService.baseToNote(note, () =>
      this.router.navigate(['/note', note.id], { queryParams: { folderId: this.folderId } }),
    );
  }
}
