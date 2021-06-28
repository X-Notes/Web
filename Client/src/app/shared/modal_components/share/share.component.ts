import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiFoldersService } from 'src/app/content/folders/api-folders.service';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import {
  ChangeTypeFullFolder,
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
  ChangeTypeFullNote,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  UpdateOneNote,
} from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { EntityType } from '../../enums/entity-types.enum';
import { FolderTypeENUM } from '../../enums/folder-types.enum';
import { NoteTypeENUM } from '../../enums/note-types.enum';
import { SearchUserForShareModal } from '../../models/short-user-for-share-modal.model';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';
import { SearchService } from '../../services/search.service';
import { ThemeENUM } from '../../enums/theme.enum';

export enum SharedType {
  Note,
  Folder,
}

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  animations: [showDropdown],
})
export class ShareComponent implements OnInit, OnDestroy {
  @ViewChild('tabs', { static: false }) tabs;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @Select(FolderStore.getUsersOnPrivateFolder)
  public usersOnPrivateFolder$: Observable<InvitedUsersToNoteOrFolder[]>;

  @Select(NoteStore.getUsersOnPrivateNote)
  public usersOnPrivateNote$: Observable<InvitedUsersToNoteOrFolder[]>;

  windowType = SharedType;

  currentWindowType: SharedType;

  noteType = NoteTypeENUM;

  themes = ThemeENUM;

  folderType = FolderTypeENUM;

  refType = RefTypeENUM;

  notes: SmallNote[] = [];

  currentNote: SmallNote;

  folders: SmallFolder[] = [];

  currentFolder: SmallFolder;

  searchStr: string;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchUsers: SearchUserForShareModal[] = [];

  selectedUsers: SearchUserForShareModal[] = [];

  commandsForChange = new Map<string, any[]>();

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

  // INVITES
  messageTextArea: string;

  isSendNotification: boolean;

  refTypeForInvite: RefTypeENUM = RefTypeENUM.Viewer;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private searchService: SearchService,
    private apiNote: ApiServiceNotes,
    private apiFolder: ApiFoldersService,
    private apiBrowserFunctions: ApiBrowserTextService,
  ) {}

  ngOnDestroy(): void {
    this.searchStrChanged.next();
    this.searchStrChanged.complete();
    const commands: any[] = [];
    this.commandsForChange.forEach((value) => value.forEach((z) => commands.push(z)));
    this.store.dispatch(commands);
  }

  ngOnInit(): void {
    const routing = this.store.selectSnapshot(AppStore.getRouting); // TODO REMOVE CHANGE ON INPUT
    switch (routing) {
      case EntityType.NoteArchive: {
        this.getNotes();
        this.currentWindowType = SharedType.Note;
        break;
      }
      case EntityType.NotePrivate: {
        this.getNotes();
        this.currentWindowType = SharedType.Note;
        break;
      }
      case EntityType.NoteDeleted: {
        this.getNotes();
        this.currentWindowType = SharedType.Note;
        break;
      }
      case EntityType.NoteShared: {
        this.getNotes();
        this.currentWindowType = SharedType.Note;
        break;
      }
      case EntityType.NoteInner: {
        this.getFullNote();
        this.currentWindowType = SharedType.Note;
        break;
      }
      case EntityType.FolderArchive: {
        this.getFolders();
        this.currentWindowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderDeleted: {
        this.getFolders();
        this.currentWindowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderPrivate: {
        this.getFolders();
        this.currentWindowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderShared: {
        this.getFolders();
        this.currentWindowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderInner: {
        this.getNotes();
        this.currentWindowType = SharedType.Note;
        break;
      }
      default: {
        throw new Error('error');
      }
    }

    this.searchStrChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 2) {
          const users = await this.searchService.searchUsers(searchStr).toPromise();
          this.searchUsers = this.userFilters(users);
        } else {
          this.searchUsers = [];
        }
      });
  }

  userFilters(items: SearchUserForShareModal[]) {
    const users = items.filter((user) => !this.selectedUsers.some((z) => z.id === user.id));
    switch (this.currentWindowType) {
      case SharedType.Note: {
        const noteUsers = this.store.selectSnapshot(NoteStore.getUsersOnPrivateNote);
        return users.filter((user) => !noteUsers.some((z) => z.id === user.id));
      }
      case SharedType.Folder: {
        const fodlerUsers = this.store.selectSnapshot(FolderStore.getUsersOnPrivateFolder);
        return users.filter((user) => !fodlerUsers.some((z) => z.id === user.id));
      }
      default: {
        throw new Error('');
      }
    }
  }

  getFolders() {
    const selectionIds = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const folders = this.store.selectSnapshot(FolderStore.getFolders);
    const foldersWithType = folders.find((z) => z.typeFolders === folderType);
    this.folders = foldersWithType.folders
      .filter((z) => selectionIds.some((x) => x === z.id))
      .map((folder) => {
        return { ...folder };
      });
    this.changeFolder(this.folders[0]);
  }

  getFullNote() {
    const fullNote = this.store.selectSnapshot(NoteStore.oneFull);
    const smallNote = { ...fullNote } as SmallNote;
    this.notes = [smallNote];
    this.changeNote(smallNote);
  }

  getNotes() {
    const selectionIds = this.store.selectSnapshot(NoteStore.selectedIds);
    const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
    const notes = this.store.selectSnapshot(NoteStore.getNotes);
    const notesWithType = notes.find((z) => z.typeNotes === noteType);
    this.notes = notesWithType.notes
      .filter((z) => selectionIds.some((x) => x === z.id))
      .map((note) => {
        return { ...note };
      });
    this.changeNote(this.notes[0]);
  }

  getFullFolder() {
    const fullFolder = this.store.selectSnapshot(FolderStore.full);
    const smallFolder = { ...fullFolder } as SmallFolder;
    this.folders = [smallFolder];
    this.changeFolder(smallFolder);
  }

  copyInputLink() {
    const type = this.currentWindowType;
    let input;
    switch (type) {
      case SharedType.Folder: {
        input = document.getElementById('linkInputFolder') as HTMLInputElement;
        break;
      }
      case SharedType.Note: {
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
    if (this.currentNote.noteTypeId !== NoteTypeENUM.Shared) {
      await this.apiNote.makePublic(RefTypeENUM.Viewer, this.currentNote.id).toPromise();
      this.currentNote.noteTypeId = NoteTypeENUM.Shared;
      this.notes.find((note) => note.id === this.currentNote.id).noteTypeId = NoteTypeENUM.Shared;
      const commands = this.factoryForCommandsShared([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(NoteTypeENUM.Shared));
    } else {
      await this.apiNote.makePrivateNotes([this.currentNote.id]).toPromise();
      this.currentNote.noteTypeId = NoteTypeENUM.Private;
      this.notes.find((note) => note.id === this.currentNote.id).noteTypeId = NoteTypeENUM.Private;
      const commands = this.factoryForCommandsPrivate([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(NoteTypeENUM.Private));
    }
  }

  async changeFolderType() {
    if (this.currentFolder.folderTypeId !== FolderTypeENUM.Shared) {
      await this.apiFolder.makePublic(RefTypeENUM.Viewer, this.currentFolder.id).toPromise();
      this.currentFolder.folderTypeId = FolderTypeENUM.Shared;
      this.folders.find((note) => note.id === this.currentFolder.id).folderTypeId =
        FolderTypeENUM.Shared;
      const commands = this.factoryForCommandsSharedFolders([this.currentFolder.id]);
      this.commandsForChange.set(this.currentFolder.id, commands);
      this.store.dispatch(new ChangeTypeFullFolder(FolderTypeENUM.Shared));
    } else {
      await this.apiFolder.makePrivateFolders([this.currentFolder.id]).toPromise();
      this.currentFolder.folderTypeId = FolderTypeENUM.Private;
      this.folders.find((folder) => folder.id === this.currentFolder.id).folderTypeId =
        FolderTypeENUM.Private;
      const commands = this.factoryForCommandsPrivateFolders([this.currentFolder.id]);
      this.commandsForChange.set(this.currentFolder.id, commands);
      this.store.dispatch(new ChangeTypeFullFolder(FolderTypeENUM.Private));
    }
  }

  factoryForCommandsShared(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeNotes(NoteTypeENUM.Archive, NoteTypeENUM.Shared, ids));
    commands.push(new TransformTypeNotes(NoteTypeENUM.Private, NoteTypeENUM.Shared, ids));
    commands.push(new TransformTypeNotes(NoteTypeENUM.Deleted, NoteTypeENUM.Shared, ids));
    commands.push(new UpdateOneNote(this.currentNote, NoteTypeENUM.Shared));
    return commands;
  }

  factoryForCommandsPrivate(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeNotes(NoteTypeENUM.Archive, NoteTypeENUM.Private, ids));
    commands.push(new TransformTypeNotes(NoteTypeENUM.Shared, NoteTypeENUM.Private, ids));
    commands.push(new TransformTypeNotes(NoteTypeENUM.Deleted, NoteTypeENUM.Private, ids));
    commands.push(new UpdateOneNote(this.currentNote, NoteTypeENUM.Private));
    return commands;
  }

  factoryForCommandsSharedFolders(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeFolders(FolderTypeENUM.Archive, FolderTypeENUM.Shared, ids));
    commands.push(new TransformTypeFolders(FolderTypeENUM.Private, FolderTypeENUM.Shared, ids));
    commands.push(new TransformTypeFolders(FolderTypeENUM.Deleted, FolderTypeENUM.Shared, ids));
    commands.push(new UpdateOneFolder(this.currentFolder, FolderTypeENUM.Shared));
    return commands;
  }

  factoryForCommandsPrivateFolders(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeFolders(FolderTypeENUM.Archive, FolderTypeENUM.Private, ids));
    commands.push(new TransformTypeFolders(FolderTypeENUM.Shared, FolderTypeENUM.Private, ids));
    commands.push(new TransformTypeFolders(FolderTypeENUM.Deleted, FolderTypeENUM.Private, ids));
    commands.push(new UpdateOneFolder(this.currentFolder, FolderTypeENUM.Private));
    return commands;
  }

  async changeRefTypeNote(refTypeId: RefTypeENUM) {
    await this.apiNote.makePublic(refTypeId, this.currentNote.id).toPromise();
    this.currentNote.refTypeId = refTypeId;
    this.notes.find((note) => note.id === this.currentNote.id).refTypeId = refTypeId;
    this.store.dispatch(new UpdateOneNote(this.currentNote, this.currentNote.noteTypeId));
  }

  async changeRefTypeFolder(refTypeId: RefTypeENUM) {
    await this.apiFolder.makePublic(refTypeId, this.currentFolder.id).toPromise();
    this.currentFolder.refTypeId = refTypeId;
    this.folders.find((folder) => folder.id === this.currentFolder.id).refTypeId = refTypeId;
    this.store.dispatch(new UpdateOneFolder(this.currentFolder, this.currentFolder.folderTypeId));
  }

  refTypeNotification(refType: RefTypeENUM): void {
    this.refTypeForInvite = refType;
  }

  async sendInvites() {
    switch (this.currentWindowType) {
      case SharedType.Folder: {
        const userIds = this.selectedUsers.map((user) => user.id);
        await this.apiFolder
          .sendInvitesToFolder(
            userIds,
            this.currentFolder.id,
            this.refTypeForInvite,
            this.isSendNotification,
            this.messageTextArea,
          )
          .toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        break;
      }
      case SharedType.Note: {
        const userIds = this.selectedUsers.map((user) => user.id);
        await this.apiNote
          .sendInvitesToNote(
            userIds,
            this.currentNote.id,
            this.refTypeForInvite,
            this.isSendNotification,
            this.messageTextArea,
          )
          .toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        break;
      }
      default: {
        throw new Error('error');
      }
    }
  }

  get isPrivateButtonActive() {
    if (this.currentWindowType === SharedType.Note) {
      return this.currentNote?.noteTypeId !== NoteTypeENUM.Shared;
    }
    if (this.currentWindowType === SharedType.Folder) {
      return this.currentFolder?.folderTypeId !== FolderTypeENUM.Shared;
    }
    throw new Error('Incorrect type');
  }

  get isSharedButtonActive() {
    if (this.currentWindowType === SharedType.Note) {
      return this.currentNote?.noteTypeId === NoteTypeENUM.Shared;
    }
    if (this.currentWindowType === SharedType.Folder) {
      return this.currentFolder?.folderTypeId === FolderTypeENUM.Shared;
    }
    throw new Error('Incorrect type');
  }

  changeNote(note: SmallNote) {
    this.currentNote = { ...note };
    this.store.dispatch(new GetInvitedUsersToNote(note.id));
  }

  changeFolder(folder: SmallFolder) {
    this.currentFolder = { ...folder };
    this.store.dispatch(new GetInvitedUsersToFolder(folder.id));
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
    console.log(text);
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
    switch (this.currentWindowType) {
      case SharedType.Folder: {
        await this.apiFolder.removeUserFromPrivateFolder(this.currentFolder.id, userId).toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        break;
      }
      case SharedType.Note: {
        await this.apiNote.removeUserFromPrivateNote(this.currentNote.id, userId).toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        break;
      }
      default: {
        throw new Error('error');
      }
    }
  }

  async changeUserPermission(refType: RefTypeENUM, id: string) {
    switch (this.currentWindowType) {
      case SharedType.Folder: {
        await this.apiFolder.changeUserPermission(this.currentFolder.id, id, refType).toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        break;
      }
      case SharedType.Note: {
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
