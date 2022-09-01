import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { LoadFullNote } from 'src/app/content/notes/state/notes-actions';
import { AuthService } from 'src/app/core/auth.service';
import { NoteStore } from 'src/app/content/notes/state/notes-state';

@Injectable({
  providedIn: 'root',
})
export class HandleAuthorizedUserGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private store: Store) {}

  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const noteId = _route.params.id;
    if (!this.authService.isLogined) {
      return true;
    }
    return this.store.dispatch(new LoadFullNote(noteId)).pipe(
      concatMap(() => this.store.select(NoteStore.canView)),
      map((canView) => {
        if (canView) {
          this.router.navigate([`notes/${noteId}`]);
        }
        return true;
      }),
    );
  }
}
