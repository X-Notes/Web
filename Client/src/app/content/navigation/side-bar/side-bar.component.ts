/* eslint-disable no-return-assign */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  billing: BillingPlanId;

  constructor(private store: Store) {}

  get userBillingPlan() {
    switch (this.billing) {
      case BillingPlanId.Standart: {
        return 'S';
      }
      case BillingPlanId.Premium: {
        return 'P';
      }
      default: {
        return '';
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      .subscribe((user) => (this.billing = user.billingPlanId));
  }
}
