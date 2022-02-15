import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { TypeAuthEnum } from '../models/type.auth.enum';
import { Store } from '@ngxs/store';
import { UserStore } from '../../core/stateUser/user-state';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  authType = TypeAuthEnum;

  constructor(private authService: AuthService, private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.authService.redirectOnSuccessAuth();
  }

  async login(typeAuth: TypeAuthEnum) {
    const user = this.store.selectSnapshot(UserStore.getUser);
    if (!Object.keys(user).length) {
      switch (typeAuth) {
        case TypeAuthEnum.Google: {
          this.authService.authGoogle();
          break;
        }
        case TypeAuthEnum.Facebook: {
          // this.authService.authFacebook();
          break;
        }
        case TypeAuthEnum.Git: {
          break;
        }
        case TypeAuthEnum.Twitter: {
          break;
        }
        default: {
          throw new Error('Incorrec type');
        }
      }
    } else {
      this.router.navigate(['notes']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
