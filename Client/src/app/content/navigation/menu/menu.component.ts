import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;
  innerNote = [
    'history', 'label', 'shared', 'copy', 'color', 'download', 'lock', 'archive', 'delete'
  ];

  constructor(public pService: PersonalizationService) { }

  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    console.log('init');
  }

}
