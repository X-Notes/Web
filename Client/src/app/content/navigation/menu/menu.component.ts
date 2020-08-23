import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';
import { NoteStore } from '../../notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { MenuButtonsService } from '../menu-buttons.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor(public pService: PersonalizationService,
              public buttonService: MenuButtonsService) { }

  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    console.log('init');
  }


}

export interface MenuItem {
  icon: string;
  operation: () => void; // arrow function
}
