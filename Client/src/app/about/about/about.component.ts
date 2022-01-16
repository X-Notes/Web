import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { TypeAuthEnum } from '../models/type.auth.enum';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  constructor(private authService: AuthService, private router: Router, private store: Store) {}

  authType = TypeAuthEnum;

  login(typeAuth: TypeAuthEnum) {
    const flag = this.store.selectSnapshot(AppStore.appLoaded);
    if (!flag) {
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
      this.router.navigate(['/notes']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
