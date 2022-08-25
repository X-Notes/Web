import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from '../enums/theme.enum';
@Component({
  selector: 'app-memory-indicator',
  templateUrl: './memory-indicator.component.html',
  styleUrls: ['./memory-indicator.component.scss'],
})
export class MemoryIndicatorComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  destroy = new Subject<void>();

  memory: number;

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

  get procent() {
    return `${(this.memory / this.userMemory) * 100}%`;
  }

  get userMemory() {
    switch (this.billing) {
      case BillingPlanId.Standart: {
        return 1000; // TODO LOAD THIS DATA FROM SERVER
      }
      case BillingPlanId.Premium: {
        return 5000;
      }
      default: {
        return 9999999; // IT`S OK
      }
    }
  }

  getIndicatorColor(theme: ThemeENUM) {
    const check = this.memory / this.userMemory;
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
      .select(UserStore.getMemoryMBytes)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((space) => (this.memory = Math.ceil(space)));

    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line no-return-assign
      .subscribe((user) => (this.billing = user.billingPlanId));
  }
}
