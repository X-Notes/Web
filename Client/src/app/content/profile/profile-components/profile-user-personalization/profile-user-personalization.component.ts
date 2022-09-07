import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UpdatePersonalization } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationEnum } from 'src/app/shared/enums/personalization.enum';

@Component({
  selector: 'app-profile-user-personalization',
  templateUrl: './profile-user-personalization.component.html',
  styleUrls: ['./profile-user-personalization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUserPersonalizationComponent implements OnInit {
  @Input() user: ShortUser;

  @Select(UserStore.getPersonalizationSettings)
  public pSettings$: Observable<PersonalizationSetting>;

  pSettings = PersonalizationEnum;

  constructor(private store: Store) {}

  get isStandard(): boolean {
    return this.user.billingPlanId === BillingPlanId.Standard;
  }

  get isPremium(): boolean {
    return this.user.billingPlanId === BillingPlanId.Premium;
  }

  ngOnInit(): void {}

  async changePersonalizationSettings(value: any, type: PersonalizationEnum) {
    const settings = { ...this.store.selectSnapshot(UserStore.getPersonalizationSettings) };
    if (type) {
      settings[type.toString()] = value;
    } else {
      throw new Error('Incorrect personalization setting');
    }
    this.store.dispatch(new UpdatePersonalization(settings));
  }
}
