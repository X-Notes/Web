import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalEventsService implements OnDestroy {
  subscription: Subscription;

  constructor(private router: Router) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.subscription = this.router.events.subscribe(() => {});
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
