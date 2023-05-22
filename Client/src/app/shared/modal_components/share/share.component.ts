import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ApiFoldersService } from 'src/app/content/folders/api-folders.service';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import {
  UpdateFullFolder,
  GetInvitedUsersToFolder,
  TransformTypeFolders,
  UpdateOneFolder,
  UnSelectAllFolder,
} from 'src/app/content/folders/state/folders-actions';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { InvitedUsersToNoteOrFolder } from 'src/app/content/notes/models/invited-users-to-note.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import {
  UpdateFullNote,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  UpdateOneNote,
  UnSelectAllNote,
} from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { FolderTypeENUM } from '../../enums/folder-types.enum';
import { NoteTypeENUM } from '../../enums/note-types.enum';
import { SearchUserForShareModal } from '../../models/short-user-for-share-modal.model';
import {
  PersonalizationService,
  showDropdown,
  smoothOpacity,
} from '../../services/personalization.service';
import { SearchService } from '../../services/search.service';
import { ThemeENUM } from '../../enums/theme.enum';
import { UpdaterEntitiesService } from 'src/app/core/entities-updater.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EntityPopupType } from '../../models/entity-popup-type.enum';
import { InvitationFormResult } from './mail-invitations/models/invitation-form-result';
import { LeftSectionShareEntity } from './left-section-entities-share/entities/left-section-share-entity';
import { MatLegacyTabChangeEvent as MatTabChangeEvent } from '@angular/material/legacy-tabs';
import { SearchComponent } from '../search/search.component';

export interface StartType {
  id: string;
  type: NoteTypeENUM | FolderTypeENUM;
  refType: RefTypeENUM;
}

export enum TabIndexes {
  Access = 0,
  Share = 1,
}

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  animations: [showDropdown, smoothOpacity()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareComponent implements OnInit, OnDestroy {
  @ViewChild('tabs', { static: false }) tabs;

  @ViewChild(SearchComponent) searchComponent!: SearchComponent;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @Select(FolderStore.getUsersOnPrivateFolder)
  private usersOnPrivateFolder$: Observable<InvitedUsersToNoteOrFolder[]>;

  @Select(NoteStore.getUsersOnPrivateNote)
  private usersOnPrivateNote$: Observable<InvitedUsersToNoteOrFolder[]>;

  notes: SmallNote[] = [];

  notesChangeRefId: SmallNote[] = [];

  currentNote: SmallNote;

  folders: SmallFolder[] = [];

  folderChangeRefId: SmallFolder[] = [];

  currentFolder: SmallFolder;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchUsers: SearchUserForShareModal[] = [];

  isSearching = false;

  isLoading = true;

  searchSymbols = 2;

  selectedUsers: SearchUserForShareModal[] = [];

  startIdsType: StartType[] = [];

  currentTab: TabIndexes;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom',
      },
      { overlayX: 'end', overlayY: 'top' },
      0,
      1,
    ),
  ];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private searchService: SearchService,
    private apiNote: ApiServiceNotes,
    private apiFolder: ApiFoldersService,
    private updaterEntitiesService: UpdaterEntitiesService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentWindowType: EntityPopupType;
      ents: SmallFolder[] | SmallNote[];
    },
    public dialogRef: MatDialogRef<ShareComponent>,
  ) {}

  get leftSectionEntities(): LeftSectionShareEntity[] {
    if (this.shareTab) {
      return this.selectedUsers.map((x) => new LeftSectionShareEntity(x.email, 'white', x.id, x));
    }
    return this.entities.map((x) => new LeftSectionShareEntity(x.title, x.color, x.id, x));
  }

  get leftSectionTitleMessage(): string {
    if (this.shareTab) {
      return 'modal.shareModal.selectedUsers';
    }
    return 'modal.shareModal.selectedNotes';
  }

  get leftTabActive(): boolean {
    if (this.shareTab) {
      return this.leftSectionEntities.length > 0;
    }
    return this.leftSectionEntities.length > 1;
  }

  get shareTab(): boolean {
    return this.currentTab === TabIndexes.Share;
  }

  get entities(): SmallFolder[] | SmallNote[] {
    if (this.isNoteWindowType) {
      return this.notes ?? [];
    }
    if (this.isFolderWindowType) {
      return this.folders ?? [];
    }
    return [];
  }

  get selectedEntityId(): string {
    if (this.isNoteWindowType) {
      return this.currentNote.id;
    }
    if (this.isFolderWindowType) {
      return this.currentFolder.id;
    }
  }

  get isNoteWindowType(): boolean {
    return this.data.currentWindowType === EntityPopupType.Note;
  }

  get isFolderWindowType(): boolean {
    return this.data.currentWindowType === EntityPopupType.Folder;
  }

  get dropdownActive(): boolean {
    return this.folderDropdownActive || this.noteDropdownActive;
  }

  get folderDropdownActive(): boolean {
    return (
      this.currentFolder?.folderTypeId === FolderTypeENUM.Shared &&
      this.isFolderWindowType &&
      this.currentFolder.refTypeId !== null
    );
  }

  get noteDropdownActive(): boolean {
    return (
      this.currentNote?.noteTypeId === NoteTypeENUM.Shared &&
      this.isNoteWindowType &&
      this.currentNote.noteTypeId !== null
    );
  }

  get refTypeSelectedValue(): RefTypeENUM {
    if (this.isNoteWindowType) {
      return this.currentNote?.refTypeId;
    }
    return this.currentFolder?.refTypeId;
  }

  get toggleDescription(): string {
    if (this.isNoteWindowType) {
      if (this.currentNote?.noteTypeId === NoteTypeENUM.Shared) {
        return 'modal.shareModal.sharedMessage';
      }
      return 'modal.shareModal.noSharedMessage';
    }
    if (this.isFolderWindowType) {
      if (this.currentFolder?.folderTypeId === FolderTypeENUM.Shared) {
        return 'modal.shareModal.sharedMessage';
      }
      return 'modal.shareModal.noSharedMessage';
    }
    throw new Error('Incorrect type');
  }

  get isPrivateButtonActive(): boolean {
    if (this.isNoteWindowType) {
      return this.currentNote?.noteTypeId !== NoteTypeENUM.Shared;
    }
    if (this.isFolderWindowType) {
      return this.currentFolder?.folderTypeId !== FolderTypeENUM.Shared;
    }
    throw new Error('Incorrect type');
  }

  get isSharedButtonActive() {
    if (this.isNoteWindowType) {
      return this.currentNote?.noteTypeId === NoteTypeENUM.Shared;
    }
    if (this.isFolderWindowType) {
      return this.currentFolder?.folderTypeId === FolderTypeENUM.Shared;
    }
    throw new Error('Incorrect type');
  }

  get invitedUsersSorted$(): Observable<InvitedUsersToNoteOrFolder[]> {
    return this.invitedUsers$.pipe(
      map((x) => x.map((q) => ({ ...q }))),
      map((x) => x?.sort((a, b) => (a.email ?? '').localeCompare(b.email ?? '')) ?? []),
    );
  }

  get isSearchActive(): boolean {
    return !this.isSearching && this.searchComponent?.searchStr?.length > this.searchSymbols;
  }

  get isSearchDisabled(): boolean {
    return !this.isSearching && this.searchComponent?.searchStr?.length <= this.searchSymbols;
  }

  get invitedUsers$(): Observable<InvitedUsersToNoteOrFolder[]> {
    if (this.isNoteWindowType) {
      return this.usersOnPrivateNote$;
    }
    if (this.isFolderWindowType) {
      return this.usersOnPrivateFolder$;
    }
    return of([]);
  }

  ngOnDestroy(): void {
    this.searchStrChanged.next();
    this.searchStrChanged.complete();

    const commandsNotes = this.notes
      .filter((x) => this.startIdsType.some((q) => q.id === x.id && q.type !== x.noteTypeId))
      .map((x) =>
        x.noteTypeId === NoteTypeENUM.Shared
          ? this.factoryForCommandNote(x.id, NoteTypeENUM.Shared, x.refTypeId)
          : this.factoryForCommandNote(x.id, NoteTypeENUM.Private, x.refTypeId),
      );

    const commandsFolders = this.folders
      .filter((x) => this.startIdsType.some((q) => q.id === x.id && q.type !== x.folderTypeId))
      .map((x) =>
        x.folderTypeId === FolderTypeENUM.Shared
          ? this.factoryForCommandFolder(x.id, FolderTypeENUM.Shared, x.refTypeId)
          : this.factoryForCommandFolder(x.id, FolderTypeENUM.Private, x.refTypeId),
      );

    const commandsNoteIds = commandsNotes.map((x) => x.selectedIds[0]);
    for (const note of this.notesChangeRefId) {
      if (!commandsNoteIds.some((x) => x === note.id)) {
        this.store.dispatch(new UpdateOneNote(note, note.id));
      }
    }

    const commandsFolderIds = commandsFolders.map((x) => x.selectedIds[0]);
    for (const folder of this.folderChangeRefId) {
      if (!commandsFolderIds.some((x) => x === folder.id)) {
        this.store.dispatch(new UpdateOneFolder(folder, folder.id));
      }
    }

    this.store.dispatch([...commandsNotes, ...commandsFolders]);
    this.store.dispatch([UnSelectAllNote, UnSelectAllFolder]);
  }

  ngOnInit(): void {
    if (this.isNoteWindowType) {
      this.getNotes();
    }
    if (this.isFolderWindowType) {
      this.getFolders();
    }

    this.searchStrChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > this.searchSymbols) {
          this.isSearching = true;
          this.cdr.detectChanges();
          const users = await this.searchService.searchUsers(searchStr).toPromise();
          this.isSearching = false;
          this.searchUsers = this.userFilters(users);
        } else {
          this.isSearching = false;
          this.searchUsers = [];
        }
        this.cdr.detectChanges();
      });
  }

  tabChanged($event: MatTabChangeEvent) {
    this.currentTab = $event.index;
    this.clearUsers();
  }

  async clearAll(): Promise<void> {
    switch (this.data.currentWindowType) {
      case EntityPopupType.Folder: {
        await this.apiFolder.clearAll(this.currentFolder.id).toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        this.updaterEntitiesService.addFolderToUpdate(this.currentFolder.id);
        break;
      }
      case EntityPopupType.Note: {
        await this.apiNote.clearAll(this.currentNote.id).toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        this.updaterEntitiesService.addNoteToUpdate(this.currentNote.id);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.cdr.detectChanges();
  }

  userFilters(items: SearchUserForShareModal[]) {
    const users = items.filter((user) => !this.selectedUsers.some((q) => q.id === user.id));
    switch (this.data.currentWindowType) {
      case EntityPopupType.Note: {
        const noteUsers = this.store.selectSnapshot(NoteStore.getUsersOnPrivateNote);
        return users.filter((user) => !noteUsers.some((q) => q.id === user.id));
      }
      case EntityPopupType.Folder: {
        const fodlerUsers = this.store.selectSnapshot(FolderStore.getUsersOnPrivateFolder);
        return users.filter((user) => !fodlerUsers.some((q) => q.id === user.id));
      }
      default: {
        throw new Error('');
      }
    }
  }

  getFolders() {
    this.folders = this.data.ents.map((folder) => ({ ...folder }));
    this.selectFolder(this.folders[0]);
  }

  getNotes() {
    this.notes = this.data.ents.map((note) => ({ ...note }));
    this.selectNote(this.notes[0]);
  }

  async changeNoteType() {
    if (!this.startIdsType.some((x) => x.id === this.currentNote.id)) {
      this.startIdsType.push({
        id: this.currentNote.id,
        type: this.currentNote.noteTypeId,
        refType: this.currentNote.refTypeId,
      });
    }

    let type = NoteTypeENUM.Private;
    if (this.currentNote.noteTypeId !== NoteTypeENUM.Shared) {
      const resp = await this.apiNote
        .makePublic(RefTypeENUM.Viewer, [this.currentNote.id])
        .toPromise();
      if (!resp.success) {
        return;
      }
      type = NoteTypeENUM.Shared;
    } else {
      const resp = await this.apiNote.makePrivate([this.currentNote.id]).toPromise();
      if (!resp.success) {
        return;
      }
    }
    this.currentNote.noteTypeId = type;
    this.notes.find((note) => note.id === this.currentNote.id).noteTypeId = type;
    this.store.dispatch(new UpdateFullNote({ noteTypeId: type }, this.currentNote.id));
    this.cdr.detectChanges();
  }

  async changeFolderType() {
    if (!this.startIdsType.some((x) => x.id === this.currentFolder.id)) {
      this.startIdsType.push({
        id: this.currentFolder.id,
        type: this.currentFolder.folderTypeId,
        refType: this.currentFolder.refTypeId,
      });
    }

    let type = FolderTypeENUM.Private;
    if (this.currentFolder.folderTypeId !== FolderTypeENUM.Shared) {
      const resp = await this.apiFolder
        .makePublic(RefTypeENUM.Viewer, [this.currentFolder.id])
        .toPromise();
      if (!resp.success) {
        return;
      }
      type = FolderTypeENUM.Shared;
    } else {
      const resp = await this.apiFolder.makePrivate([this.currentFolder.id]).toPromise();
      if (!resp.success) {
        return;
      }
    }
    this.currentFolder.folderTypeId = type;
    this.folders.find((folder) => folder.id === this.currentFolder.id).folderTypeId = type;
    this.store.dispatch([new UpdateFullFolder({ folderTypeId: type }, this.currentFolder.id)]);
    this.cdr.detectChanges();
  }

  factoryForCommandNote = (
    id: string,
    typeTo: NoteTypeENUM,
    refType: RefTypeENUM,
  ): TransformTypeNotes => {
    return new TransformTypeNotes(typeTo, [id], false, refType);
  };

  factoryForCommandFolder = (
    id: string,
    typeTo: FolderTypeENUM,
    refType: RefTypeENUM,
  ): TransformTypeFolders => {
    return new TransformTypeFolders(typeTo, [id], false, refType);
  };

  async changeRefTypeNote(refType: RefTypeENUM): Promise<void> {
    await this.apiNote.makePublic(refType, [this.currentNote.id]).toPromise();
    this.currentNote.refTypeId = refType;
    this.notes.find((note) => note.id === this.currentNote.id).refTypeId = refType;
    this.notesChangeRefId.push(this.currentNote);
    this.cdr.detectChanges();
  }

  async changeRefTypeFolder(refType: RefTypeENUM): Promise<void> {
    await this.apiFolder.makePublic(refType, [this.currentFolder.id]).toPromise();
    this.currentFolder.refTypeId = refType;
    this.folders.find((folder) => folder.id === this.currentFolder.id).refTypeId = refType;
    this.folderChangeRefId.push(this.currentFolder);
    this.cdr.detectChanges();
  }

  async sendInvites(model: InvitationFormResult) {
    const userIds = this.selectedUsers.map((user) => user.id);
    switch (this.data.currentWindowType) {
      case EntityPopupType.Folder: {
        await this.apiFolder
          .sendInvitesToFolder(userIds, this.currentFolder.id, model.refTypeForInvite)
          .toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        this.updaterEntitiesService.addFolderToUpdate(this.currentFolder.id);
        break;
      }
      case EntityPopupType.Note: {
        await this.apiNote
          .sendInvitesToNote(userIds, this.currentNote.id, model.refTypeForInvite)
          .toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        this.updaterEntitiesService.addNoteToUpdate(this.currentNote.id);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.clearUsers();
  }

  async onClick(ent: LeftSectionShareEntity) {
    if (this.shareTab) {
      return;
    }
    if (this.isNoteWindowType) {
      await this.selectNote(ent.entity);
    }
    if (this.isFolderWindowType) {
      await this.selectFolder(ent.entity);
    }
    this.cdr.detectChanges();
  }

  async selectNote(note: SmallNote) {
    this.currentNote = { ...note };
    this.isLoading = true;
    await this.store.dispatch(new GetInvitedUsersToNote(note.id)).toPromise();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async selectFolder(folder: SmallFolder) {
    this.currentFolder = { ...folder };
    this.isLoading = true;
    await this.store.dispatch(new GetInvitedUsersToFolder(folder.id)).toPromise();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  reloadTabToggle(): void {
    setTimeout(() => {
      this.tabs.realignInkBar();
      this.cdr.detectChanges();
    }, 150);
  }

  changed(text: string) {
    this.searchStrChanged.next(text);
  }

  clearUsers(): void {
    this.selectedUsers = [];
    this.searchUsers = [];
    this.searchComponent.clear();
    this.cdr.detectChanges();
  }

  addUserToInvite(user: SearchUserForShareModal) {
    this.selectedUsers.push(user);
    this.searchUsers = this.searchUsers.filter((q) => q.id !== user.id);
    requestAnimationFrame(() => this.cdr.detectChanges());
  }

  removeUserFromInvites(user: SearchUserForShareModal) {
    this.selectedUsers = this.selectedUsers.filter((q) => q.id !== user.id);
    this.searchUsers.unshift(user);
    requestAnimationFrame(() => this.cdr.detectChanges());
  }

  async removeUserWithPermissions(userId: string) {
    switch (this.data.currentWindowType) {
      case EntityPopupType.Folder: {
        await this.apiFolder.removeUserFromPrivateFolder(this.currentFolder.id, userId).toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        this.updaterEntitiesService.addFolderToUpdate(this.currentFolder.id);
        break;
      }
      case EntityPopupType.Note: {
        await this.apiNote.removeUserFromPrivateNote(this.currentNote.id, userId).toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        this.updaterEntitiesService.addNoteToUpdate(this.currentNote.id);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.cdr.detectChanges();
  }

  async changeUserPermission(refType: RefTypeENUM, id: string) {
    switch (this.data.currentWindowType) {
      case EntityPopupType.Folder: {
        await this.apiFolder.changeUserPermission(this.currentFolder.id, id, refType).toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        break;
      }
      case EntityPopupType.Note: {
        await this.apiNote.changeUserPermission(this.currentNote.id, id, refType).toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        break;
      }
      default: {
        throw new Error('');
      }
    }
    this.cdr.detectChanges();
  }
}
