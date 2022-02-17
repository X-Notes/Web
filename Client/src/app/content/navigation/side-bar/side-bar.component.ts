/* eslint-disable no-return-assign */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { BillingENUM } from 'src/app/shared/enums/billing.enum';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  billing: BillingENUM;

  constructor(private store: Store) {}

  get userBillingPlan() {
    switch (this.billing) {
      case BillingENUM.Free: {
        return 'F';
      }
      case BillingENUM.Standart: {
        return 'S';
      }
      case BillingENUM.Business: {
        return 'B';
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
