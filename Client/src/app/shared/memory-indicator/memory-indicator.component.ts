import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
@Component({
  selector: 'app-memory-indicator',
  templateUrl: './memory-indicator.component.html',
  styleUrls: ['./memory-indicator.component.scss'],
})
export class MemoryIndicatorComponent {
  constructor(private store: Store) {}

  userMemory = 100;

  get memory() {
    return Math.ceil(this.store.selectSnapshot(UserStore.getMemoryMBytes));
  }

  get indicatorColor() {
    const check = this.memory / this.userMemory;
    if (check < 0.25) {
      return 'white';
    } else if (check >= 0.25 && check < 0.85) {
      return '#ff6969';
    } else {
      return '#ff6969';
    }
  }

  get procent() {
    return (this.memory / this.userMemory) * 100 + '%';
  }
}
