import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserStore } from '../stateUser/user-state';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router =  inject(Router);
  if(store.selectSnapshot(UserStore.isLogged)) {
    return true;
  }
  return router.navigateByUrl('login');
};
