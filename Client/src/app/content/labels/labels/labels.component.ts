import { Component } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { LabelStore } from '../state/labels-state';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
})
export class LabelsComponent {
  @Select(LabelStore.countAll)
  countAll$: Observable<number>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  constructor(public pService: PersonalizationService) {}
}
