import { AfterViewInit, ElementRef, Renderer2, ViewChild, Component } from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FullNote } from 'src/app/content/notes/models/fullNote';
import { OnlineUsersNote } from 'src/app/content/notes/models/online-users-note';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import {
  PersonalizationService,
  showMenuLeftRight,
} from 'src/app/shared/services/personalization.service';
import { DialogsManageService } from '../../dialogs-manage.service';
import { MenuButtonsService } from '../../menu-buttons.service';

@Component({
  selector: 'app-interaction-inner-note',
  templateUrl: './interaction-inner-note.component.html',
  styleUrls: ['./interaction-inner-note.component.scss'],
  animations: [showMenuLeftRight],
})
export class InteractionInnerNoteComponent implements AfterViewInit {
  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.getOnlineUsersOnNote)
  onlineUsers$: Observable<OnlineUsersNote[]>;

  @ViewChild('heightPeople') heightPeople: ElementRef;

  @ViewChild('scrollbar') scrollbar: ElementRef;

  constructor(
    public pService: PersonalizationService,
    public renderer: Renderer2,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
  ) {}

  ngAfterViewInit(): void {
    this.setHeightScrollbar();
  }

  closeMenu(): void {
    if (this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if (!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  setHeightScrollbar(): void {
    if (this.pService.users && this.scrollbar) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.pService.checkWidth()
        ? this.renderer.setStyle(
            this.scrollbar?.nativeElement,
            'height',
            `${this.heightPeople?.nativeElement?.clientHeight}px`,
          )
        : this.renderer.setStyle(this.scrollbar?.nativeElement, 'height', '100%');
    }
  }

  showUsers() {
    this.pService.users = !this.pService.users;
    setTimeout(() => this.setHeightScrollbar());
  }

  // eslint-disable-next-line consistent-return
  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
  }
}
