import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { from, Observable, of, throwError } from 'rxjs';
import { mergeMap, retryWhen, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

export const InterceptorSkipToken = 'X-Skip-Token';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  publicRoutes: string[] = ['/folder/', '/note/'];

  constructor(private readonly auth: AuthService, private router: Router) {}

  isPublicRoute(route: string): boolean {
    return this.publicRoutes.some((x) => route.includes(x));
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublicRoute = this.isPublicRoute(this.router.url);
    return from(this.auth.getToken()).pipe(
      switchMap((token) => {
        if (request.headers.has(InterceptorSkipToken)) {
          const headers2 = request.headers.delete(InterceptorSkipToken);
          return next.handle(request.clone({ headers: headers2 }));
        }
        const headers = request.headers.set('Authorization', 'Bearer ' + token);
        const requestClone = request.clone({
          headers,
        });
        return next.handle(requestClone);
      }),
      retryWhen((errors: Observable<any>) =>
        errors.pipe(
          mergeMap((error, index) => {
            if (isPublicRoute) {
              return of(null);
            }
            if (error.status !== 401) {
              return throwError(error);
            }
            if (index === 0) {
              return this.auth.getToken(true);
            }
            this.auth.logout();
            return throwError(error);
          }),
          take(2),
        ),
      ),
    );
  }
}
