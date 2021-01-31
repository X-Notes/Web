import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetDefaultBackground } from 'src/app/core/stateUser/user-action';

@Component({
  selector: 'app-interaction-profile',
  templateUrl: './interaction-profile.component.html',
  styleUrls: ['./interaction-profile.component.scss']
})
export class InteractionProfileComponent implements OnInit {

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  setDefaultColorProfile() {
    this.store.dispatch(new SetDefaultBackground());
  }

}
