import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetDefaultBackground } from 'src/app/core/stateUser/user-action';

@Component({
  selector: 'app-interaction-profile',
  templateUrl: './interaction-profile.component.html',
  styleUrls: ['./interaction-profile.component.scss'],
})
export class InteractionProfileComponent {
  constructor(private store: Store) {}

  setDefaultColorProfile() {
    this.store.dispatch(new SetDefaultBackground());
  }
}
