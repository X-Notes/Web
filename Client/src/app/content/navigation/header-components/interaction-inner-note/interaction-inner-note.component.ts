import { ElementRef, Renderer2, ViewChild, Component } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FullNote } from 'src/app/content/notes/models/full-note.model';
import { OnlineUsersNote } from 'src/app/content/notes/models/online-users-note.model';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import {
  PersonalizationService,
  showMenuLeftRight,
} from 'src/app/shared/services/personalization.service';
import { DialogsManageService } from '../../services/dialogs-manage.service';
import { MenuButtonsService } from '../../services/menu-buttons.service';

@Component({
  selector: 'app-interaction-inner-note',
  templateUrl: './interaction-inner-note.component.html',
  styleUrls: ['./interaction-inner-note.component.scss'],
  animations: [showMenuLeftRight],
})
export class InteractionInnerNoteComponent {
  @Select(NoteStore.canView)
  canView$: Observable<boolean>;

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.isOwner)
  isOwner$: Observable<boolean>;

  @Select(NoteStore.getOnlineUsersOnNote)
  onlineUsers$: Observable<OnlineUsersNote[]>;

  @ViewChild('heightPeople') heightPeople: ElementRef;

  @ViewChild('scrollbar') scrollbar: ElementRef;

  constructor(
    public pService: PersonalizationService,
    public renderer: Renderer2,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
    private store: Store,
  ) {}

  closeMenu(): void {
    if (this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if (!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }

  openShareWithNotes() {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      const ids = [this.store.selectSnapshot(NoteStore.oneFull).id];
      return this.dialogsManageService.openShareEntity(EntityPopupType.Note, ids);
    }
    return this.dialogsManageService.openShareEntity(
      EntityPopupType.Note,
      this.store.selectSnapshot(NoteStore.selectedIds),
    );
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
    return false;
  }
}
