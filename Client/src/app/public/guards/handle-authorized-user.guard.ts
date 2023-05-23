import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, DefaultUrlSerializer } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';

export const HandleAuthorizedUserGuard = (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot,) =>  {
  const router = inject(Router) as Router;
  const authService = inject(AuthService) as AuthService;

  const id = _route.params.id;
  const parsedUrl = new DefaultUrlSerializer().parse(_state.url);
  const path =
    parsedUrl.root.children.primary.segments.at(0)?.path === 'note' ? 'notes' : 'folders';
  if (!authService.isLogined) {
    return true;
  }
  router.navigate([`${path}/${id}`]);
}
