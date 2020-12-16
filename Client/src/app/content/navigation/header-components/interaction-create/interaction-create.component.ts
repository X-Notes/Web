import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-interaction-create',
  templateUrl: './interaction-create.component.html',
  styleUrls: ['./interaction-create.component.scss']
})
export class InteractionCreateComponent implements OnInit {

  @Input() themeHeader: Theme;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  newButton() {
    this.pService.subject.next(true);
  }

}
