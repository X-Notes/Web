import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Store, Select } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { UpdateRoutePath } from 'src/app/core/stateApp/app-action';
import { RoutePathes } from 'src/app/shared/enums/RoutePathes';



@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(LabelStore.countAll)
  countAll$: Observable<number>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  theme = Theme;

  constructor(
    public pService: PersonalizationService,
    private store: Store, ) {}

  async ngOnInit() {

    this.store.dispatch(new UpdateRoutePath(RoutePathes.Label));

    this.pService.onResize();
  }
}
