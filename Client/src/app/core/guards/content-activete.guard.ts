import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Store } from '@ngxs/store';
import { UserStore } from '../stateUser/user-state';

@Injectable()
export class ContentActiveteGuard implements CanActivate {
  constructor(private authservice: AuthService, private router: Router,
              private store: Store) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const flag = this.store.selectSnapshot(UserStore.getStatus);
      if (flag) {
        return flag;
      } else {
        this.router.navigate(['/about']);
      }
  }

}
