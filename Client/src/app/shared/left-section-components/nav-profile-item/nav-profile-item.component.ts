import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationService, timeSidenavAnimation } from '../../services/personalization.service';

@Component({
  selector: 'app-nav-profile-item',
  templateUrl: './nav-profile-item.component.html',
  styleUrls: ['./nav-profile-item.component.scss'],
})
export class NavProfileItemComponent implements OnInit {
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public photoError = false;

  constructor(private router: Router, private pService: PersonalizationService) {}

  ngOnInit(): void {}

  changeSource() {
    this.photoError = true;
  }

  redirectToProfile() {
    this.pService.cancelSideBar();
    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, timeSidenavAnimation);
  }
}
