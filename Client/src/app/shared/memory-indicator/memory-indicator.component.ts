import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { BillingENUM } from '../enums/billing.enum';
@Component({
  selector: 'app-memory-indicator',
  templateUrl: './memory-indicator.component.html',
  styleUrls: ['./memory-indicator.component.scss'],
})
export class MemoryIndicatorComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  memory: number;

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

  get userMemory() {
    switch (this.billing) {
      case BillingENUM.Free: {
        return 1000; // TODO LOAD THIS DATA FROM SERVER
      }
      case BillingENUM.Standart: {
        return 5000;
      }
      case BillingENUM.Business: {
        return 20000;
      }
      default: {
        return 9999999; // IT`S OK
      }
    }
  }

  get indicatorColor() {
    const check = this.memory / this.userMemory;
    if (check < 0.65) {
      return 'white';
    }
    if (check >= 0.65 && check < 0.85) {
      return '#ffed69';
    }
    return '#ff6969';
  }

  get procent() {
    return `${(this.memory / this.userMemory) * 100}%`;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store
      .select(UserStore.getMemoryMBytes)
      .pipe(takeUntil(this.destroy))
      .subscribe((space) => (this.memory = Math.ceil(space)));

    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      .subscribe((user) => (this.billing = user.billingPlanId));
  }
}
