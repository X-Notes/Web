import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from '../enums/theme.enum';
import { BillingPlan } from 'src/app/core/models/billing/billing-plan';
@Component({
  selector: 'app-memory-indicator',
  templateUrl: './memory-indicator.component.html',
  styleUrls: ['./memory-indicator.component.scss'],
})
export class MemoryIndicatorComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  destroy = new Subject<void>();

  memoryUsedBytes: number;

  memoryUsedM: number;

  billing: BillingPlanId;

  plans: BillingPlan[];

  constructor(private store: Store) {}

  get userBillingPlan() {
    switch (this.billing) {
      case BillingPlanId.Standard: {
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

  get procent() {
    return `${(this.memoryUsedBytes / this.userPlan?.maxSize) * 100}%`;
  }

  get userPlan(): BillingPlan {
    return this.plans.find((x) => x.id === this.billing);
  }

  get userMemory(): string {
    return this.userPlan?.getMemoryMb;
  }

  getIndicatorColor(theme: ThemeENUM) {
    const check = this.memoryUsedBytes / this.userPlan?.maxSize;
    if (check < 0.85) {
      return theme === ThemeENUM.Dark ? 'white' : '#404040';
    }
    return '#ff6969';
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store
      .select(UserStore.getMemoryBytes)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((space) => (this.memoryUsedBytes = space));

    this.store
      .select(UserStore.getMemoryMBytes)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((m) => (this.memoryUsedM = Math.ceil(m)));

    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((user) => (this.billing = user.billingPlanId));

    this.store
      .select(UserStore.getBillingsPlans)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((plans) => (this.plans = plans));
  }
}
