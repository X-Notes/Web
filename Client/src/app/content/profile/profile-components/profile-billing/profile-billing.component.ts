import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BillingPlan } from 'src/app/core/models/billing/billing-plan';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UpdateBillingUserPlan } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-profile-billing',
  templateUrl: './profile-billing.component.html',
  styleUrls: ['./profile-billing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileBillingComponent implements OnInit {
  @Input() user: ShortUser;

  @Select(UserStore.getBillingsPlans)
  public billingPlans$: Observable<BillingPlan[]>;

  billingPlanId = BillingPlanId;

  constructor(private store: Store, private translate: TranslateService) {}

  ngOnInit(): void {}

  getTitleById(planId: BillingPlanId): string {
    switch (planId) {
      case BillingPlanId.Standart: {
        return 'Standart';
      }
      case BillingPlanId.Premium: {
        return 'Premium';
      }
      default: {
        return '';
      }
    }
  }

  getHistoryValueById(planId: BillingPlanId): string {
    switch (planId) {
      case BillingPlanId.Standart: {
        return this.translate.instant('profile-billing.history-last-15');
      }
      case BillingPlanId.Premium: {
        return this.translate.instant('profile-billing.history-all');
      }
      default: {
        return '';
      }
    }
  }

  getCount(number: number): string {
    if(number >= 1000) {
      return `${(number / 1000)}k`;
    }
    return number.toString();
  }

  getSize = (size: number) => (size / Math.pow(1024, 2));

  updateBillingPlan(plan: BillingPlanId): void {
    this.store.dispatch(new UpdateBillingUserPlan(plan));
  }

  get hasUserPremium(): boolean {
    return this.user.billingPlanId === BillingPlanId.Premium;
  } 

  get hasUserDefault(): boolean {
    return this.user.billingPlanId === BillingPlanId.Standart;
  } 
}
