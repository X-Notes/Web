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
import { EntitiesSizeENUM } from '../../../../shared/enums/font-size.enum';
import { PersonalizationService } from '../../../../shared/services/personalization.service';
import { OnDestroy } from '@angular/core';
import { SmallNote } from '../../../../content/notes/models/small-note.model';
import { GetPublicUser } from '../../../storage/public-action';
import { PublicStore } from '../../../storage/public-state';
import { ShortUserPublic } from '../../../interfaces/short-user-public.model';
import { UpdaterEntitiesService } from '../../../../core/entities-updater.service';
import { WebSocketsFolderUpdaterService } from 'src/app/content/folders/full-folder/services/web-sockets-folder-updater.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-public-folder-content',
  templateUrl: './public-folder-content.component.html',
  styleUrls: ['./public-folder-content.component.scss'],
  providers: [FullFolderNotesService, WebSocketsFolderUpdaterService, DestroyComponentService],
})
export class PublicFolderContentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements?: QueryList<ElementRef>;

  @Select(FolderStore.full)
  folder$?: Observable<FullFolder>;

  @Select(FolderStore.isCanViewFullFolder)
  isCanView$?: Observable<boolean>;

  @Select(PublicStore.owner)
  owner$?: Observable<ShortUserPublic>;

  fontSize = EntitiesSizeENUM;

  loaded = false;

  private routeSubscription?: Subscription;

  private folderId?: string;

  constructor(
    private readonly route: ActivatedRoute,
    public readonly pService: PersonalizationService,
    public readonly ffnService: FullFolderNotesService,
    private readonly store: Store,
    private readonly apiFullFolder: ApiFullFolderService,
    private readonly router: Router,
    private readonly updateNoteService: UpdaterEntitiesService,
    public authService: AuthService,
  ) {
    this.pService.setSpinnerState(true);
    this.routeSubscription = this.route.params.subscribe(async (params) => {
      this.loaded = false;
      // lOAD FOLDER
      this.folderId = params.id;
      if (!this.folderId) return;
      await this.store.dispatch(new LoadFullFolder(this.folderId)).toPromise();
      const folder = this.store.selectSnapshot(FolderStore.full);
      if (folder) {
        const ownerId = this.store.selectSnapshot(FolderStore.getOwnerId);
        await this.store.dispatch(new GetPublicUser(ownerId)).toPromise();

        // INIT FOLDER NOTES
        const notes = await this.apiFullFolder.getFolderNotes(this.folderId).toPromise();
        await this.ffnService.initializePublicEntities(notes, this.folderId);
        this.ffnService.updateState();
      }

      await this.pService.waitPreloading();
      this.pService.setSpinnerState(false);
      this.loaded = true;

      // this.webSocketsFolderUpdaterService.tryJoinToFolder(this.folderId);
    });
  }

  ngOnInit() {
    this.authService.redirectOnSuccessAuth(`folders/${this.folderId}`);
  }

  ngAfterViewInit(): void {
    this.ffnService.murriInitialize(this.refElements);
  }

  ngOnDestroy(): void {
    this.ffnService.onDestroy();
    if (this.folderId) {
      this.updateNoteService.addFolderToUpdate(this.folderId);
    }
    this.routeSubscription?.unsubscribe();
  }

  toPublicNote(note: SmallNote) {
    this.ffnService.baseToNote(note, () =>
      this.router.navigate(['/note', note.id], { queryParams: { folderId: this.folderId } }),
    );
  }
}
