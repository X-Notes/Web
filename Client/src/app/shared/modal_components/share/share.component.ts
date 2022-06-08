import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiFoldersService } from 'src/app/content/folders/api-folders.service';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import {
  UpdateFullFolder,
  GetInvitedUsersToFolder,
  TransformTypeFolders,
  UpdateOneFolder,
} from 'src/app/content/folders/state/folders-actions';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { InvitedUsersToNoteOrFolder } from 'src/app/content/notes/models/invited-users-to-note.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import {
  UpdateFullNote,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  UpdateOneNote,
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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EntityPopupType } from '../../models/entity-popup-type.enum';
import { InvitationFormResult } from './mail-invitations/models/invitation-form-result';

export interface StartType {
  id: string;
  type: NoteTypeENUM | FolderTypeENUM;
}

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  animations: [showDropdown, smoothOpacity()],
})
export class ShareComponent implements OnInit, OnDestroy {
  @ViewChild('tabs', { static: false }) tabs;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @Select(FolderStore.getUsersOnPrivateFolder)
  private usersOnPrivateFolder$: Observable<InvitedUsersToNoteOrFolder[]>;

  @Select(NoteStore.getUsersOnPrivateNote)
  private usersOnPrivateNote$: Observable<InvitedUsersToNoteOrFolder[]>;

  windowType = EntityPopupType;

  noteType = NoteTypeENUM;

  themes = ThemeENUM;

  folderType = FolderTypeENUM;

  refType = RefTypeENUM;

  refTypes = Object.values(RefTypeENUM).filter((x) => typeof x === 'string');

  notes: SmallNote[] = [];

  currentNote: SmallNote;

  folders: SmallFolder[] = [];

  currentFolder: SmallFolder;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchUsers: SearchUserForShareModal[] = [];

  isSearching = false;

  isLoading = true;

  selectedUsers: SearchUserForShareModal[] = [];

  startIdsType: StartType[] = [];

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
    private apiBrowserFunctions: ApiBrowserTextService,
    private updaterEntitiesService: UpdaterEntitiesService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentWindowType: EntityPopupType;
      ents: SmallFolder[] | SmallNote[];
    },
  ) {}

  get folderDropdownActive(): boolean {
    return (
      this.currentFolder?.folderTypeId === FolderTypeENUM.Shared &&
      this.data.currentWindowType === this.windowType.Folder &&
      this.currentFolder.refTypeId !== null
    );
  }

  get noteDropdownActive(): boolean {
    return (
      this.currentNote?.noteTypeId === NoteTypeENUM.Shared &&
      this.data.currentWindowType === this.windowType.Note &&
      this.currentNote.noteTypeId !== null
    );
  }

  get folderSelectedValue(): string {
    return this.refType[this.currentFolder?.refTypeId];
  }

  get noteSelectedValue(): string {
    return this.refType[this.currentNote?.refTypeId];
  }

  get isPrivateButtonActive() {
    if (this.data.currentWindowType === EntityPopupType.Note) {
      return this.currentNote?.noteTypeId !== NoteTypeENUM.Shared;
    }
    if (this.data.currentWindowType === EntityPopupType.Folder) {
      return this.currentFolder?.folderTypeId !== FolderTypeENUM.Shared;
    }
    throw new Error('Incorrect type');
  }

  get isSharedButtonActive() {
    if (this.data.currentWindowType === EntityPopupType.Note) {
      return this.currentNote?.noteTypeId === NoteTypeENUM.Shared;
    }
    if (this.data.currentWindowType === EntityPopupType.Folder) {
      return this.currentFolder?.folderTypeId === FolderTypeENUM.Shared;
    }
    throw new Error('Incorrect type');
  }

  get invitedUsers$(): Observable<InvitedUsersToNoteOrFolder[]> {
    if (this.data.currentWindowType === this.windowType.Note) {
      return this.usersOnPrivateNote$;
    }
    if (this.data.currentWindowType === this.windowType.Folder) {
      return this.usersOnPrivateFolder$;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.searchStrChanged.next();
    this.searchStrChanged.complete();

    const commandsNotes = this.notes
      .filter((x) => this.startIdsType.some((z) => z.id === x.id && z.type !== x.noteTypeId))
      .map((x) =>
        x.noteTypeId === NoteTypeENUM.Shared
          ? this.factoryForCommandNote(x.id, NoteTypeENUM.Shared)
          : this.factoryForCommandNote(x.id, NoteTypeENUM.Private),
      );

    const commandsFolders = this.folders
      .filter((x) => this.startIdsType.some((z) => z.id === x.id && z.type !== x.folderTypeId))
      .map((x) =>
        x.folderTypeId === FolderTypeENUM.Shared
          ? this.factoryForCommandFolder(x.id, FolderTypeENUM.Shared)
          : this.factoryForCommandFolder(x.id, FolderTypeENUM.Private),
      );

    this.store.dispatch([...commandsNotes, ...commandsFolders]);
  }

  ngOnInit(): void {
    if (this.data.currentWindowType === EntityPopupType.Note) {
      this.getNotes();
    }
    if (this.data.currentWindowType === EntityPopupType.Folder) {
      this.getFolders();
    }

    this.searchStrChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 2) {
          this.isSearching = true;
          const users = await this.searchService.searchUsers(searchStr).toPromise();
          this.isSearching = false;
          this.searchUsers = this.userFilters(users);
        } else {
          this.isSearching = false;
          this.searchUsers = [];
        }
      });
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
  }

  userFilters(items: SearchUserForShareModal[]) {
    const users = items.filter((user) => !this.selectedUsers.some((z) => z.id === user.id));
    switch (this.data.currentWindowType) {
      case EntityPopupType.Note: {
        const noteUsers = this.store.selectSnapshot(NoteStore.getUsersOnPrivateNote);
        return users.filter((user) => !noteUsers.some((z) => z.id === user.id));
      }
      case EntityPopupType.Folder: {
        const fodlerUsers = this.store.selectSnapshot(FolderStore.getUsersOnPrivateFolder);
        return users.filter((user) => !fodlerUsers.some((z) => z.id === user.id));
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

  copyInputLink() {
    let input;
    switch (this.data.currentWindowType) {
      case EntityPopupType.Folder: {
        input = document.getElementById('linkInputFolder') as HTMLInputElement;
        break;
      }
      case EntityPopupType.Note: {
        input = document.getElementById('linkInputNote') as HTMLInputElement;
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.apiBrowserFunctions.copyInputLink(input);
  }

  async changeNoteType() {
    if (!this.startIdsType.some((x) => x.id === this.currentNote.id)) {
      this.startIdsType.push({ id: this.currentNote.id, type: this.currentNote.noteTypeId });
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
  }

  async changeFolderType() {
    if (!this.startIdsType.some((x) => x.id === this.currentFolder.id)) {
      this.startIdsType.push({ id: this.currentFolder.id, type: this.currentFolder.folderTypeId });
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
  }

  factoryForCommandNote = (id: string, typeTo: NoteTypeENUM): TransformTypeNotes => {
    return new TransformTypeNotes(typeTo, [id], false);
  };

  factoryForCommandFolder = (id: string, typeTo: FolderTypeENUM): TransformTypeFolders => {
    return new TransformTypeFolders(typeTo, [id], false);
  };

  async changeRefTypeNote(refTypeId: string) {
    const refType = this.refType[refTypeId]; // map from string to number;
    await this.apiNote.makePublic(refType, [this.currentNote.id]).toPromise();
    this.currentNote.refTypeId = refType;
    this.notes.find((note) => note.id === this.currentNote.id).refTypeId = refType;
    this.store.dispatch(new UpdateOneNote(this.currentNote));
  }

  async changeRefTypeFolder(refTypeId: string) {
    const refType = this.refType[refTypeId]; // map from string to number;
    await this.apiFolder.makePublic(refType, [this.currentFolder.id]).toPromise();
    this.currentFolder.refTypeId = refType;
    this.folders.find((folder) => folder.id === this.currentFolder.id).refTypeId = refType;
    this.store.dispatch(new UpdateOneFolder(this.currentFolder));
  }

  async sendInvites(model: InvitationFormResult) {
    const userIds = this.selectedUsers.map((user) => user.id);
    switch (this.data.currentWindowType) {
      case EntityPopupType.Folder: {
        await this.apiFolder
          .sendInvitesToFolder(
            userIds,
            this.currentFolder.id,
            model.refTypeForInvite,
            model.isSendNotification,
            model.messageTextArea,
          )
          .toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        this.updaterEntitiesService.addFolderToUpdate(this.currentFolder.id);
        break;
      }
      case EntityPopupType.Note: {
        await this.apiNote
          .sendInvitesToNote(
            userIds,
            this.currentNote.id,
            model.refTypeForInvite,
            model.isSendNotification,
            model.messageTextArea,
          )
          .toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        this.updaterEntitiesService.addNoteToUpdate(this.currentNote.id);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.selectedUsers = [];
  }

  async selectNote(note: SmallNote) {
    this.currentNote = { ...note };
    this.isLoading = true;
    await this.store.dispatch(new GetInvitedUsersToNote(note.id)).toPromise();
    this.isLoading = false;
  }

  async selectFolder(folder: SmallFolder) {
    this.currentFolder = { ...folder };
    this.isLoading = true;
    await this.store.dispatch(new GetInvitedUsersToFolder(folder.id)).toPromise();
    this.isLoading = false;
  }

  collapseToggle() {
    this.pService.isCollapseShared = !this.pService.isCollapseShared;
    setTimeout(() => {
      this.tabs.realignInkBar();
    }, 150);
  }

  disableTooltipUser(): boolean {
    if (this.pService.isCollapseShared) {
      return false;
    }
    return true;
  }

  changed(text: string) {
    this.searchStrChanged.next(text);
  }

  addUserToInvite(user: SearchUserForShareModal) {
    this.selectedUsers.push(user);
    this.searchUsers = this.searchUsers.filter((z) => z.id !== user.id);
  }

  removeUserFromInvites(user: SearchUserForShareModal) {
    this.selectedUsers = this.selectedUsers.filter((z) => z.id !== user.id);
    this.searchUsers.unshift(user);
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
  }
}
