import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiFoldersService } from 'src/app/content/folders/api-folders.service';
import { Folder } from 'src/app/content/folders/models/folder';
import { ChangeTypeFullFolder, GetInvitedUsersToFolder, TransformTypeFolders, UpdateOneFolder } from 'src/app/content/folders/state/folders-actions';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { InvitedUsersToNoteOrFolder } from 'src/app/content/notes/models/invitedUsersToNote';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { ChangeTypeFullNote, GetInvitedUsersToNote, TransformTypeNotes, UpdateOneNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { RefType } from 'src/app/core/models/refType';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntityType } from '../../enums/EntityTypes';
import { FolderType } from '../../enums/FolderTypes';
import { NoteType } from '../../enums/NoteTypes';
import { Theme } from '../../enums/Theme';
import { SearchUserForShareModal } from '../../models/shortUserForShareModal';
import { PersonalizationService, showHistory } from '../../services/personalization.service';
import { SearchService } from '../../services/search.service';
import { DialogData } from '../dialog_data';

export enum SharedType {
  Note,
  Folder
}

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  animations: [showHistory]
})
export class ShareComponent implements OnInit, OnDestroy {

  windowType = SharedType;
  currentWindowType: SharedType;

  dropdownActive = false;
  isCollapse = true;
  noteType = NoteType;
  folderType = FolderType;
  refType = RefType;

  notes: SmallNote[] = [];
  currentNote: SmallNote;

  folders: Folder[] = [];
  currentFolder: Folder;

  searchStr: string;
  searchStrChanged: Subject<string> = new Subject<string>();
  searchUsers: SearchUserForShareModal[] = [];
  selectedUsers: SearchUserForShareModal[] = [];

  @ViewChild('overlay') overlay: ElementRef;
  @ViewChild('overlay2') overlay2: ElementRef;
  @ViewChild('tabs', { static: false }) tabs;

  @Select(NoteStore.getUsersOnPrivateNote)
  public usersOnPrivateNote$: Observable<InvitedUsersToNoteOrFolder[]>;

  @Select(FolderStore.getUsersOnPrivateFolder)
  public usersOnPrivateFolder$: Observable<InvitedUsersToNoteOrFolder[]>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  commandsForChange = new Map<string, any[]>();

  // INVITES
  messageTextArea: string;
  isSendNotification: boolean;
  refTypeForInvite: RefType = RefType.Viewer;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public pService: PersonalizationService,
    private rend: Renderer2,
    private store: Store,
    private searchService: SearchService,
    private apiNote: ApiServiceNotes,
    private apiFolder: ApiFoldersService) {
  }

  ngOnDestroy(): void {
    this.searchStrChanged.next();
    this.searchStrChanged.complete();
    const commands: any[] = [];
    this.commandsForChange.forEach((value, key) => value.forEach(z => commands.push(z)));
    this.store.dispatch(commands);
  }

  ngOnInit(): void {
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
    }

    this.searchStrChanged.pipe(
      debounceTime(350),
      distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 2) {
          const users = await this.searchService.searchUsers(searchStr).toPromise();
          this.searchUsers = this.userFilters(users);
        } else {
          this.searchUsers = [];
        }
      });
  }

  userFilters(users: SearchUserForShareModal[]) {
    users = users.filter(user => !this.selectedUsers.some(z => z.id === user.id));
    switch (this.currentWindowType) {
      case SharedType.Note: {
        const noteUsers =  this.store.selectSnapshot(NoteStore.getUsersOnPrivateNote);
        return users.filter(user => !noteUsers.some(z => z.id === user.id));
      }
      case SharedType.Folder: {
        const fodlerUsers =  this.store.selectSnapshot(FolderStore.getUsersOnPrivateFolder);
        return users.filter(user => !fodlerUsers.some(z => z.id === user.id));
      }
    }
  }

  getFolders() {
    const selectionIds = this.store.selectSnapshot(FolderStore.selectedIds);
    const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
    const folders = this.store.selectSnapshot(FolderStore.getFolders);
    const foldersWithType = folders.find(z => z.typeFolders === folderType);
    this.folders = foldersWithType.folders.filter(z => selectionIds.some(x => x === z.id)).map(folder => {
      return { ...folder };
    });
    this.changeFolder(this.folders[0]);
  }

  getFullNote() {
    const fullNote = this.store.selectSnapshot(NoteStore.oneFull);
    const smallNote = {...fullNote} as SmallNote;
    this.notes = [smallNote];
    this.changeNote(smallNote);
  }

  getNotes() {
    const selectionIds = this.store.selectSnapshot(NoteStore.selectedIds);
    const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
    const notes = this.store.selectSnapshot(NoteStore.getNotes);
    const notesWithType = notes.find(z => z.typeNotes === noteType);
    this.notes = notesWithType.notes.filter(z => selectionIds.some(x => x === z.id)).map(note => {
      return { ...note };
    });
    this.changeNote(this.notes[0]);
  }

  getFullFolder() {
    const fullFolder = this.store.selectSnapshot(FolderStore.full);
    const smallFolder = {...fullFolder} as Folder;
    this.folders = [smallFolder];
    this.changeFolder(smallFolder);
  }

  copyInputLink() {
    const type = this.currentWindowType;
    switch (type) {
      case SharedType.Folder: {
        const input = document.getElementById('linkInputFolder') as HTMLInputElement;
        input.select();
        document.execCommand('copy');
        input.setSelectionRange(0, 0);
        break;
      }
      case SharedType.Note: {
        const input = document.getElementById('linkInputNote') as HTMLInputElement;
        input.select();
        document.execCommand('copy');
        input.setSelectionRange(0, 0);
        break;
      }
    }
  }

  changeActive() {
    this.dropdownActive = !this.dropdownActive;
    if (this.dropdownActive) {
      if (this.overlay) {
        this.rend.setStyle(this.overlay.nativeElement, 'display', 'block');
      }
      if (this.overlay2) {
        this.rend.setStyle(this.overlay2.nativeElement, 'display', 'block');
      }
    } else {
      if (this.overlay) {
        this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
      }
      if (this.overlay2) {
        this.rend.setStyle(this.overlay2.nativeElement, 'display', 'none');
      }
    }
  }

  async changeNoteType() {
    if (this.currentNote.noteType !== NoteType.Shared) {
      await this.apiNote.makePublic(RefType.Viewer, this.currentNote.id).toPromise();
      this.currentNote.noteType = NoteType.Shared;
      this.notes.find(note => note.id === this.currentNote.id).noteType = NoteType.Shared;
      const commands = this.factoryForCommandsShared([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Shared));
    } else {
      await this.apiNote.makePrivateNotes([this.currentNote.id]).toPromise();
      this.currentNote.noteType = NoteType.Private;
      this.notes.find(note => note.id === this.currentNote.id).noteType = NoteType.Private;
      const commands = this.factoryForCommandsPrivate([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Private));
    }
  }

  async changeFolderType() {
    if (this.currentFolder.folderType !== FolderType.Shared) {
      await this.apiFolder.makePublic(RefType.Viewer, this.currentFolder.id).toPromise();
      this.currentFolder.folderType = FolderType.Shared;
      this.folders.find(note => note.id === this.currentFolder.id).folderType = FolderType.Shared;
      const commands = this.factoryForCommandsSharedFolders([this.currentFolder.id]);
      this.commandsForChange.set(this.currentFolder.id, commands);
      this.store.dispatch(new ChangeTypeFullFolder(FolderType.Shared));
    } else {
      await this.apiFolder.makePrivateFolders([this.currentFolder.id]).toPromise();
      this.currentFolder.folderType = FolderType.Private;
      this.folders.find(folder => folder.id === this.currentFolder.id).folderType = FolderType.Private;
      const commands = this.factoryForCommandsPrivateFolders([this.currentFolder.id]);
      this.commandsForChange.set(this.currentFolder.id, commands);
      this.store.dispatch(new ChangeTypeFullFolder(FolderType.Private));
    }
  }


  factoryForCommandsShared(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeNotes(NoteType.Archive, NoteType.Shared, ids));
    commands.push(new TransformTypeNotes(NoteType.Private, NoteType.Shared, ids));
    commands.push(new TransformTypeNotes(NoteType.Deleted, NoteType.Shared, ids));
    commands.push(new UpdateOneNote(this.currentNote,  NoteType.Shared));
    return commands;
  }


  factoryForCommandsPrivate(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeNotes(NoteType.Archive, NoteType.Private, ids));
    commands.push(new TransformTypeNotes(NoteType.Shared, NoteType.Private, ids));
    commands.push(new TransformTypeNotes(NoteType.Deleted, NoteType.Private, ids));
    commands.push(new UpdateOneNote(this.currentNote, NoteType.Private));
    return commands;
  }

  factoryForCommandsSharedFolders(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeFolders(FolderType.Archive, FolderType.Shared, ids));
    commands.push(new TransformTypeFolders(FolderType.Private, FolderType.Shared, ids));
    commands.push(new TransformTypeFolders(FolderType.Deleted, FolderType.Shared, ids));
    commands.push(new UpdateOneFolder(this.currentFolder,  FolderType.Shared));
    return commands;
  }


  factoryForCommandsPrivateFolders(ids: string[]) {
    const commands: any[] = [];
    commands.push(new TransformTypeFolders(FolderType.Archive, FolderType.Private, ids));
    commands.push(new TransformTypeFolders(FolderType.Shared, FolderType.Private, ids));
    commands.push(new TransformTypeFolders(FolderType.Deleted, FolderType.Private, ids));
    commands.push(new UpdateOneFolder(this.currentFolder, FolderType.Private));
    return commands;
  }

  async changeRefTypeNote(refType: RefType) {
    await this.apiNote.makePublic(refType, this.currentNote.id).toPromise();
    this.currentNote.refType = refType;
    this.notes.find(note => note.id === this.currentNote.id).refType = refType;
    this.store.dispatch(new UpdateOneNote(this.currentNote,  this.currentNote.noteType));
  }

  async changeRefTypeFolder(refType: RefType) {
    await this.apiFolder.makePublic(refType, this.currentFolder.id).toPromise();
    this.currentFolder.refType = refType;
    this.folders.find(folder => folder.id === this.currentFolder.id).refType = refType;
    this.store.dispatch(new UpdateOneFolder(this.currentFolder,  this.currentFolder.folderType));
  }

  refTypeNotification(refType: RefType): void {
    this.refTypeForInvite = refType;
  }

  async sendInvites() {
    switch (this.currentWindowType) {
      case SharedType.Folder: {
        const userIds = this.selectedUsers.map(user => user.id);
        await this.apiFolder.sendInvitesToFolder(userIds, this.currentFolder.id, this.refTypeForInvite,
          this.isSendNotification, this.messageTextArea).toPromise();
        this.store.dispatch(new GetInvitedUsersToFolder(this.currentFolder.id));
        break;
      }
      case SharedType.Note: {
        const userIds = this.selectedUsers.map(user => user.id);
        await this.apiNote.sendInvitesToNote(userIds, this.currentNote.id, this.refTypeForInvite,
          this.isSendNotification, this.messageTextArea).toPromise();
        this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
        break;
      }
    }
  }

  changeNote(note: SmallNote) {
    this.currentNote = { ...note };
    this.store.dispatch(new GetInvitedUsersToNote(note.id));
  }

  changeFolder(folder: Folder) {
    this.currentFolder = { ...folder };
    this.store.dispatch(new GetInvitedUsersToFolder(folder.id));
  }

  cancelDropdown() {
    this.dropdownActive = true;
    this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
    this.rend.setStyle(this.overlay2.nativeElement, 'display', 'none');
  }

  collapseToggle() {
    this.isCollapse = !this.isCollapse;
    setTimeout(() => {
      this.tabs.realignInkBar();
    }, 150);
  }

  disableTooltipUser(): boolean {
    if (this.isCollapse) {
      return false;
    } else {
      return true;
    }
  }

  changed(text: string) {
    this.searchStrChanged.next(text);
  }

  addUserToInvite(user: SearchUserForShareModal) {
    this.selectedUsers.push(user);
    this.searchUsers = this.searchUsers.filter(z => z.id !== user.id);
  }

  removeUserFromInvites(user: SearchUserForShareModal) {
    this.selectedUsers = this.selectedUsers.filter(z => z.id !== user.id);
    this.searchUsers.unshift(user);
  }

  async removeUserWithPermissions(userId: number) {
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
    }
  }

  async changeUserPermission(refType: RefType, id: number) {
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
    }
  }
}
