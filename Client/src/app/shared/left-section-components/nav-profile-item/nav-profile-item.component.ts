import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-nav-profile-item',
  templateUrl: './nav-profile-item.component.html',
  styleUrls: ['./nav-profile-item.component.scss'],
})
export class NavProfileItemComponent implements OnInit {
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public photoError = false;

  constructor() {}

  ngOnInit(): void {}

  changeSource() {
    this.photoError = true;
  }
}
