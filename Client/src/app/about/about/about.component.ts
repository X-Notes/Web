import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private store: Store) { }

  ngOnInit(): void {
  }

  login() {
    const flag = this.store.selectSnapshot(UserStore.getTokenUpdated);
    if (!flag) {
      this.authService.GoogleAuth();
    } else {
      this.router.navigate(['/notes']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
