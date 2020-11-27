import { Component, Input, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { SetDefaultBackground } from 'src/app/core/stateUser/user-action';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-interaction-profile',
  templateUrl: './interaction-profile.component.html',
  styleUrls: ['./interaction-profile.component.scss']
})
export class InteractionProfileComponent implements OnInit {

  @Input() themeHeader: Theme;

  theme = Theme;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  setDefaultColorProfile() {
    this.store.dispatch(new SetDefaultBackground());
  }

}
