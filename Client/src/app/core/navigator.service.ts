import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EntityType } from '../shared/enums/entity-types.enum';

@Injectable({
  providedIn: 'root'
})
export class NavigatorService {

  route$: BehaviorSubject<ActivatedRouteSnapshot> = new BehaviorSubject<ActivatedRouteSnapshot>(null);

  routeType$: BehaviorSubject<EntityType> = new BehaviorSubject<EntityType>(null);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      let route = this.route.snapshot;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const routeKey = route?.routeConfig?.data?.route_key;
      this.routeType$.next(routeKey);
      this.route$.next(route);
    });
  }

  init = () => { };
}
