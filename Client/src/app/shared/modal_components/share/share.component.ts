import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiFoldersService } from 'src/app/content/folders/api-folders.service';
import { SmallFolder } from 'src/app/content/folders/models/folder';
import {
  ChangeTypeFullFolder,
  GetInvitedUsersToFolder,
  TransformTypeFolders,
  UpdateOneFolder,
} from 'src/app/content/folders/state/folders-actions';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { InvitedUsersToNoteOrFolder } from 'src/app/content/notes/models/invitedUsersToNote';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import {
  ChangeTypeFullNote,
  GetInvitedUsersToNote,
  TransformTypeNotes,
  UpdateOneNote,
} from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { RefTypeENUM } from 'src/app/shared/enums/refTypeEnum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { EntityType } from '../../enums/EntityTypes';
import { FolderTypeENUM } from '../../enums/FolderTypesEnum';
import { NoteTypeENUM } from '../../enums/NoteTypesEnum';
import { SearchUserForShareModal } from '../../models/shortUserForShareModal';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';
import { SearchService } from '../../services/search.service';
import { Theme } from '../../models/Theme';

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
  public theme$: Observable<Theme>;

  @Select(FolderStore.getUsersOnPrivateFolder)
  public usersOnPrivateFolder$: Observable<InvitedUsersToNoteOrFolder[]>;

  windowType = SharedType;

  currentWindowType: SharedType;

  noteType = NoteTypeENUM;

  folderType = FolderTypeENUM;

  refType = RefTypeENUM;

  notes: SmallNote[] = [];

  currentNote: SmallNote;

  folders: SmallFolder[] = [];

  currentFolder: SmallFolder;

  searchStr: string;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchUsers: SearchUserForShareModal[] = [];

  selectedUsers: SearchUserForShareModal[] = [
    {
      id: '1',
      name: 'asdsadsad',
      email: 'asdadsad',
      photoId: null,
    },
    {
      id: '1',
      name: 'asdsadsad',
      email: 'asdadsad',
      photoId: null,
    },
    {
      id: '1',
      name: 'asdsadsad',
      email: 'asdadsad',
      photoId: null,
    },
  ];

  public usersOnPrivateNote$: any = [
    {
      id: '1',
      name: 'asdsadsad',
      email: 'asdadsad',
      photoId: null,
    },
    {
      id: '1',
      name: 'asdsadsad',
      email: 'asdadsad',
      photoId: null,
    },
    {
      id: '1',
      name: 'asdsadsad',
      email: 'asdadsad',
      photoId: null,
    },
  ];

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

  refTypeForInvite: RefTypeENUM = RefTypeENUM.viewer;

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
    this.pService.onResize();
    const routing = this.store.selectSnapshot(AppStore.getRouting);
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
        this.getFullFolder();
        this.currentWindowType = SharedType.Folder;
        break;
      }
      default: {
        throw new Error('error');
      }
    }

    this.searchStrChanged.pipe(debounceTime(searchDelay), distinctUntilChanged()).subscribe(async (searchStr) => {
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
    if (this.currentNote.noteType.name !== NoteTypeENUM.Shared) {
      console.log('private');
      const shareType = this.store.selectSnapshot(AppStore.getNoteTypes).find((x) => x.name === NoteTypeENUM.Shared);
      const viewer = this.store
        .selectSnapshot(AppStore.getRefs)
        .find((x) => x.name.toLowerCase() === RefTypeENUM.viewer);
      await this.apiNote.makePublic(viewer, this.currentNote.id).toPromise();
      this.currentNote.noteType = shareType;
      this.notes.find((note) => note.id === this.currentNote.id).noteType = shareType;
      const commands = this.factoryForCommandsShared([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(shareType));
    } else {
      console.log('share');
      const privateType = this.store.selectSnapshot(AppStore.getNoteTypes).find((x) => x.name === NoteTypeENUM.Private);
      await this.apiNote.makePrivateNotes([this.currentNote.id]).toPromise();
      this.currentNote.noteType = privateType;
      this.notes.find((note) => note.id === this.currentNote.id).noteType = privateType;
      const commands = this.factoryForCommandsPrivate([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(privateType));
    }
  }

  async changeFolderType() {
    if (this.currentFolder.folderType.name.toLowerCase() !== FolderTypeENUM.Shared) {
      const shareType = this.store
        .selectSnapshot(AppStore.getFolderTypes)
        .find((x) => x?.name.toLowerCase() === FolderTypeENUM.Shared);
      const viewer = this.store
        .selectSnapshot(AppStore.getRefs)
        .find((x) => x?.name.toLowerCase() === RefTypeENUM.viewer);
      await this.apiFolder.makePublic(viewer, this.currentFolder.id).toPromise();
      this.currentFolder.folderType = shareType;
      this.folders.find((note) => note.id === this.currentFolder.id).folderType = shareType;
      const commands = this.factoryForCommandsSharedFolders([this.currentFolder.id]);
      this.commandsForChange.set(this.currentFolder.id, commands);
      this.store.dispatch(new ChangeTypeFullFolder(shareType));
    } else {
      const privateType = this.store
        .selectSnapshot(AppStore.getFolderTypes)
        .find((x) => x?.name.toLowerCase() === FolderTypeENUM.Private);
      await this.apiFolder.makePrivateFolders([this.currentFolder.id]).toPromise();
      this.currentFolder.folderType = privateType;
      this.folders.find((folder) => folder.id === this.currentFolder.id).folderType = privateType;
      const commands = this.factoryForCommandsPrivateFolders([this.currentFolder.id]);
      this.commandsForChange.set(this.currentFolder.id, commands);
      this.store.dispatch(new ChangeTypeFullFolder(privateType));
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

  async changeRefTypeNote(refTypeRoad: string) {
    const refType = this.store.selectSnapshot(AppStore.getRefs).find((x) => x.name.toLowerCase() === refTypeRoad);
    await this.apiNote.makePublic(refType, this.currentNote.id).toPromise();
    this.currentNote.refType = refType;
    this.notes.find((note) => note.id === this.currentNote.id).refType = refType;
    this.store.dispatch(new UpdateOneNote(this.currentNote, this.currentNote.noteType.name));
  }

  async changeRefTypeFolder(refTypeRoad: string) {
    const refType = this.store.selectSnapshot(AppStore.getRefs).find((x) => x.name.toLowerCase() === refTypeRoad);
    await this.apiFolder.makePublic(refType, this.currentFolder.id).toPromise();
    this.currentFolder.refType = refType;
    this.folders.find((folder) => folder.id === this.currentFolder.id).refType = refType;
    this.store.dispatch(new UpdateOneFolder(this.currentFolder, this.currentFolder.folderType.name));
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

  changeNote(note: SmallNote) {
    this.currentNote = { ...note };
    console.log(this.currentNote);
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
