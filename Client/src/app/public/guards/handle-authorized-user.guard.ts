import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
  DefaultUrlSerializer,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class HandleAuthorizedUserGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private store: Store) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const id = _route.params.id;
    const parsedUrl = new DefaultUrlSerializer().parse(_state.url);
    const path =
      parsedUrl.root.children.primary.segments.at(0)?.path === 'note' ? 'notes' : 'folders';
    if (!this.authService.isLogined) {
      return true;
    }
    this.router.navigate([`${path}/${id}`]);
  }
}
