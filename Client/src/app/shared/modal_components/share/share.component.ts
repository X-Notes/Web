import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InvitedUsersToNote } from 'src/app/content/notes/models/invitedUsersToNote';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { GetInvitedUsersToNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntityType } from '../../enums/EntityTypes';
import { Theme } from '../../enums/Theme';
import { SearchUserForShareModal } from '../../models/shortUserForShareModal';
import { PersonalizationService, showHistory } from '../../services/personalization.service';
import { SearchService } from '../../services/search.service';
import { DialogData } from '../dialog_data';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  animations: [showHistory]
})
export class ShareComponent implements OnInit, OnDestroy {
  dropdownActive = false;
  isCollapse = true;
  isPrivate: boolean;

  notes: SmallNote[] = [];
  currentNoteId: string;

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public pService: PersonalizationService,
    private rend: Renderer2,
    private store: Store,
    private searchService: SearchService) { }

  ngOnDestroy(): void {
    this.searchStrChanged.next();
    this.searchStrChanged.complete();
  }

  ngOnInit(): void {
    const routing = this.store.selectSnapshot(AppStore.getRouting);
    switch (routing) {
      case EntityType.NoteArchive: {
        this.isPrivate = true;
        this.getNotes();
        break;
      }
      case EntityType.NotePrivate: {
        this.isPrivate = true;
        this.getNotes();
        break;
      }
      case EntityType.NoteDeleted: {
        this.isPrivate = true;
        this.getNotes();
        break;
      }
      case EntityType.NoteShared: {
        this.isPrivate = false;
        this.getNotes();
        break;
      }
      case EntityType.NoteInner: {
        break;
      }
      // TODO add folder
    }

    this.searchStrChanged.pipe(
      debounceTime(350),
      distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 2) {
          this.searchUsers = await this.searchService.searchUsers(searchStr).toPromise();
        } else {
          this.searchUsers = [];
        }
      });
  }

  getNotes() {
    const selectionIds = this.store.selectSnapshot(NoteStore.selectedIds);
    const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
    const notes = this.store.selectSnapshot(NoteStore.getNotes);
    const notesWithType = notes.find(z => z.typeNotes === noteType);
    this.notes = notesWithType.notes.filter(z => selectionIds.some(x => x === z.id));
    this.changeNote(this.notes[0]);
  }

  copyInputLink(linkInput) {
    linkInput.select();
    document.execCommand('copy');
    linkInput.setSelectionRange(0, 0);
  }

  changeActive() {
    this.dropdownActive = !this.dropdownActive;
    if (this.dropdownActive) {
      this.rend.setStyle(this.overlay.nativeElement, 'display', 'block');
      this.rend.setStyle(this.overlay2.nativeElement, 'display', 'block');
    } else {
      this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
      this.rend.setStyle(this.overlay2.nativeElement, 'display', 'none');

    }
  }

  changeAccess(): void {
    this.isPrivate = !this.isPrivate;
  }

  setLanguage(item: any): void {
    switch (item) {
      case 'Private':
        console.log('private');
        break;
      case 'Shared':
        console.log('shared');
        break;
    }
  }

  changeNote(note: SmallNote) {
    this.currentNoteId = note.id;
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
  }
}
