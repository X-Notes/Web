import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-right-section',
  templateUrl: './right-section.component.html',
  styleUrls: ['./right-section.component.scss']
})
export class RightSectionComponent implements OnInit {

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  constructor(public pService: PersonalizationService,
              public murriService: MurriService,
              private store: Store, ) { }

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
