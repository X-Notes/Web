import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';
import { NoteStore } from '../../notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteType } from 'src/app/shared/enums/NoteTypes';

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

  items: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => 5
    },
    {
      icon: 'copy',
      operation: () => 5
    },
    {
      icon: 'color',
      operation: () => 5
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    }
  ];

  constructor(public pService: PersonalizationService) { }

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
