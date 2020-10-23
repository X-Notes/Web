import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-button-change-view',
  templateUrl: './button-change-view.component.html',
  styleUrls: ['./button-change-view.component.scss']
})
export class ButtonChangeViewComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor(public pService: PersonalizationService,
              public murriService: MurriService, ) { }

  ngOnInit(): void {
  }

  toggleOrientation() {
    this.pService.orientationMobile = !this.pService.orientationMobile;
    setTimeout( () => this.murriService.grid.refreshItems().layout(), 0);
  }

}
