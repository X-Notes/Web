import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService, AuthStatus } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { TypeAuthEnum } from '../models/type.auth.enum';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  authType = TypeAuthEnum;

  isLoaded = false;

  constructor(public authService: AuthService, private router: Router, private store: Store) {}

  ngAfterViewInit(): void {
    setTimeout(() => (this.isLoaded = true), 150);
  }

  ngOnInit(): void {
    this.authService.redirectOnSuccessAuth(); // after auth redirection need call this method in order to login to app
  }

  async login(typeAuth: TypeAuthEnum) {
    if (this.authService.authStatus.value === AuthStatus.InProgress) return;
    if (!this.authService.isLogined) {
      // don`t user !user because object user always exist like object.
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
          throw new Error('Incorrect type');
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
