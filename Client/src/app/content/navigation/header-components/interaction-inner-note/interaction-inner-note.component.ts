import { Renderer2, Component } from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FullNote } from 'src/app/content/notes/models/full-note.model';
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
export class InteractionInnerNoteComponent {
  @Select(NoteStore.canView)
  canView$: Observable<boolean>;

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.isOwner)
  isOwner$: Observable<boolean>;

  constructor(
    public pService: PersonalizationService,
    public renderer: Renderer2,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
  ) {}

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }
}
