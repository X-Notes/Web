import { Component, Input } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MenuButtonsService } from '../menu-buttons.service';
import { NoteStore } from '../../notes/state/notes-state';
import { MenuItem } from '../menu_item';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(NoteStore.selectedCount)
  public selectedCount$: Observable<number>;

  @Input()
  public items: MenuItem[] = [];

  constructor(public pService: PersonalizationService, public buttonService: MenuButtonsService) {}

  // eslint-disable-next-line consistent-return
  disableTooltpUser = () => {
    if (!this.pService.check()) {
      return true;
    }
    return false;
  };
}
