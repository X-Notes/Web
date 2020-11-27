import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { InvitedUsersToNote } from 'src/app/content/notes/models/invitedUsersToNote';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { ChangeTypeFullNote, GetInvitedUsersToNote, TransformTypeNotes, UpdateOneNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { RefType } from 'src/app/core/models/refType';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntityType } from '../../enums/EntityTypes';
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

  windowType: SharedType;

  dropdownActive = false;
  isCollapse = true;
  noteType = NoteType;
  refType = RefType;

  notes: SmallNote[] = [];
  currentNote: SmallNote;

  searchStr: string;
  searchStrChanged: Subject<string> = new Subject<string>();
  searchUsers: SearchUserForShareModal[] = [];
  selectedUsers: SearchUserForShareModal[] = [];

  @ViewChild('overlay') overlay: ElementRef;
  @ViewChild('overlay2') overlay2: ElementRef;
  @ViewChild('tabs', { static: false }) tabs;

  @Select(NoteStore.getUsersOnPrivateNote)
  public usersOnPrivateNote$: Observable<InvitedUsersToNote[]>;

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
    private api: ApiServiceNotes) {
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
        this.windowType = SharedType.Note;
        break;
      }
      case EntityType.NotePrivate: {
        this.getNotes();
        this.windowType = SharedType.Note;
        break;
      }
      case EntityType.NoteDeleted: {
        this.getNotes();
        this.windowType = SharedType.Note;
        break;
      }
      case EntityType.NoteShared: {
        this.getNotes();
        this.windowType = SharedType.Note;
        break;
      }
      case EntityType.NoteInner: {
        this.getFullNote();
        this.windowType = SharedType.Note;
        break;
      }
      case EntityType.FolderArchive: {
        this.getFolders();
        this.windowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderDeleted: {
        this.getFolders();
        this.windowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderPrivate: {
        this.getFolders();
        this.windowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderShared: {
        this.getFolders();
        this.windowType = SharedType.Folder;
        break;
      }
      case EntityType.FolderInner: {
        this.getFullFolder();
        this.windowType = SharedType.Folder;
        break;
      }
    }

    this.searchStrChanged.pipe(
      debounceTime(350),
      distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 2) {
          const users = await this.searchService.searchUsers(searchStr).toPromise();
          this.searchUsers = users.filter(user => !this.selectedUsers.some(z => z.id === user.id));
        } else {
          this.searchUsers = [];
        }
      });
  }

  getFolders() {
    // TODO
  }

  getFullFolder() {
    // TODO
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

  getFullNote() {
    const fullNote = this.store.selectSnapshot(NoteStore.oneFull);
    const smallNote = {...fullNote} as SmallNote;
    this.notes = [smallNote];
    this.changeNote(smallNote);
  }

  copyInputLink(linkInput) {
    linkInput.select();
    document.execCommand('copy');
    linkInput.setSelectionRange(0, 0);
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
      await this.api.makePublic(RefType.Viewer, this.currentNote.id).toPromise();
      this.currentNote.noteType = NoteType.Shared;
      this.notes.find(note => note.id === this.currentNote.id).noteType = NoteType.Shared;
      const commands = this.factoryForCommandsShared([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Shared));
    } else {
      await this.api.makePrivateNotes([this.currentNote.id]).toPromise();
      this.currentNote.noteType = NoteType.Private;
      this.notes.find(note => note.id === this.currentNote.id).noteType = NoteType.Private;
      const commands = this.factoryForCommandsPrivate([this.currentNote.id]);
      this.commandsForChange.set(this.currentNote.id, commands);
      this.store.dispatch(new ChangeTypeFullNote(NoteType.Private));
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

  async changeRefType(refType: RefType) {
    await this.api.makePublic(refType, this.currentNote.id).toPromise();
    this.currentNote.refType = refType;
    this.notes.find(note => note.id === this.currentNote.id).refType = refType;
    this.store.dispatch(new UpdateOneNote(this.currentNote,  this.currentNote.noteType));
  }

  refTypeNotification(refType: RefType): void {
    this.refTypeForInvite = refType;
  }

  async sendInvites() {
    const userIds = this.selectedUsers.map(user => user.id);
    await this.api.sendInvitesToNote(userIds, this.currentNote.id, this.refTypeForInvite,
      this.isSendNotification, this.messageTextArea).toPromise();
    this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
  }

  changeNote(note: SmallNote) {
    this.currentNote = { ...note };
    this.store.dispatch(new GetInvitedUsersToNote(note.id));
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

  // User Permission on private note
  async removeUserWithPermissions(userId: number) {
    await this.api.removeUserFromPrivateNote(this.currentNote.id, userId).toPromise();
    this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
  }

  async changeUserPermission(refType: RefType, id: number) {
    await this.api.changeUserPermission(this.currentNote.id, id, refType).toPromise();
    this.store.dispatch(new GetInvitedUsersToNote(this.currentNote.id));
  }
}
