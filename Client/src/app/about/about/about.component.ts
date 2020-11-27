import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';

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
    const flag = this.store.selectSnapshot(AppStore.getTokenUpdated);
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
