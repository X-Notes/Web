import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { MatMenu } from '@angular/material/menu';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/full-folder.model';
import { SmallFolder } from '../models/folder.model';
import { FullFolderNotesService } from './services/full-folder-notes.service';
import { DialogsManageService } from '../../navigation/services/dialogs-manage.service';
import { ApiFullFolderService } from './services/api-full-folder.service';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { SelectIdNote, SetFolderNotes, UnSelectAllNote } from '../../notes/state/notes-actions';
import { NoteStore } from '../../notes/state/notes-state';
import { MenuButtonsService } from '../../navigation/services/menu-buttons.service';
import { PermissionsButtonsService } from '../../navigation/services/permissions-buttons.service';
import { LoadLabels } from '../../labels/state/labels-actions';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
})
export class FullFolderComponent implements OnInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild('folderTitle', { read: ElementRef }) folderTitleEl: ElementRef<HTMLInputElement>;

  @ViewChild(MatMenu) menu: MatMenu;

  @Select(FolderStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(FolderStore.full)
  public folder$: Observable<FullFolder>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = FontSizeENUM;

  foldersLink: SmallFolder[] = [];

  loaded = false;

  // TITLE
  title: string;

  uiTitle: string;

  titleChange$: Subject<string> = new Subject<string>();

  private folderId: string;

  constructor(
    private store: Store,
    private router: Router,
    public pService: PersonalizationService,
    public ffnService: FullFolderNotesService,
    public dialogsService: DialogsManageService,
    private apiFullFolder: ApiFullFolderService,
    public menuButtonService: MenuButtonsService,
    public noteApiService: ApiServiceNotes,
    public pB: PermissionsButtonsService,
  ) {}

  async ngOnInit() {
    this.store.dispatch(new LoadLabels());

    this.initManageButtonSubscribe();
    this.initHeaderButtonSubscribe();
  }

  initHeaderButtonSubscribe() {
    this.pService.newButtonSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const newNote = await this.noteApiService.new().toPromise();
          await this.apiFullFolder.addNotesToFolder([newNote.id], this.folderId).toPromise();
          this.ffnService.addToDom([newNote]);
          this.updateState();
        }
      });

    this.pService.selectAllButton
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const notes = this.ffnService.entities.filter((x) => !x.isSelected);
          // eslint-disable-next-line no-param-reassign
          notes.forEach((x) => (x.isSelected = true));
          const actions = notes.map((x) => new SelectIdNote(x.id));
          this.store.dispatch(actions);
        }
      });
  }

  initManageButtonSubscribe() {
    this.pService.addNotesToFolderSubject.pipe(takeUntil(this.ffnService.destroy)).subscribe(() => {
      const instanse = this.dialogsService.openAddNotesToFolder();
      instanse
        .afterClosed()
        .pipe(takeUntil(this.ffnService.destroy))
        .subscribe(async (resp) => {
          if (resp) {
            const ids = resp.map((x) => x.id);
            await this.apiFullFolder.addNotesToFolder(ids, this.folderId).toPromise();
            await this.ffnService.handleAdding(ids);
            this.updateState();
          }
        });
    });

    this.pService.removeNotesToFolderSubject
      .pipe(takeUntil(this.ffnService.destroy))
      .subscribe(async () => {
        const ids = this.store.selectSnapshot(NoteStore.selectedIds);
        const res = await this.apiFullFolder.removeNotesFromFolder(ids, this.folderId).toPromise();
        if (res.success) {
          this.ffnService.deleteFromDom(ids);
          this.updateState();
        }
        this.store.dispatch(UnSelectAllNote);
      });
  }

  updateState(): void {
    const isHasEntities = this.ffnService.entities?.length > 0;
    this.pService.isInnerFolderSelectAllActive$.next(isHasEntities);
    const mappedNotes = this.ffnService.entities.map((x) => ({ ...x }));
    this.store.dispatch(new SetFolderNotes(mappedNotes));
  }

  navigateToFolder(folderId: string): void {
    this.store.dispatch(UnSelectAllNote);
    this.router.navigate(['/folders/', folderId]);
  }
}
