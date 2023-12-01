import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
  theme$?: Observable<ThemeENUM>;

  destroy = new Subject<void>();

  memoryUsedBytes$ = new BehaviorSubject<number>(0);

  memoryUsedM$ = new BehaviorSubject<number>(0);

  billing$ = new BehaviorSubject<BillingPlanId>(null);

  plans?: BillingPlan[];

  constructor(private store: Store) {}

  get userBillingPlan() {
    switch (this.billing$.getValue()) {
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

  get percent(): string {
    if(!this.memoryUsedBytes$.getValue() || !this.userPlan?.maxSize) return '';
    return `${(this.memoryUsedBytes$.getValue() / this.userPlan?.maxSize) * 100}%`;
  }

  get userPlan(): BillingPlan | undefined {
    if(!this.plans) return;
    return this.plans.find((x) => x.id === this.billing$.getValue());
  }

  get userMemory(): string | undefined {
    return this.userPlan?.getMemoryMb;
  }

  getIndicatorColor(theme: ThemeENUM) {
    if(!this.memoryUsedBytes$.getValue() || !this.userPlan?.maxSize) return '';
    const check = this.memoryUsedBytes$.getValue() / this.userPlan?.maxSize;
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
      .subscribe((space) => (this.memoryUsedBytes$.next(space)));

    this.store
      .select(UserStore.getMemoryMBytes)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((m) => {
        this.memoryUsedM$.next(Math.ceil(m));
      });

    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((user) => (this.billing$.next(user.billingPlanId)));

    this.store
      .select(UserStore.getBillingsPlans)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((plans) => (this.plans = plans));
  }
}
