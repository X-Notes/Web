import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-tools',
  templateUrl: './interaction-tools.component.html',
  styleUrls: ['./interaction-tools.component.scss']
})
export class InteractionToolsComponent implements OnInit {

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  theme = Theme;

  constructor(public pService: PersonalizationService,
              public murriService: MurriService,
              private store: Store) { }

  ngOnInit(): void {
  }

  toggleOrientation() {
    this.pService.orientationMobile = !this.pService.orientationMobile;
    setTimeout( () => this.murriService.grid.refreshItems().layout(), 0);
  }

  toggleTheme() {
    this.store.dispatch(new ChangeTheme());
  }

}
