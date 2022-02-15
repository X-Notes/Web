import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { from, Observable, throwError } from 'rxjs';
import { mergeMap, retryWhen, switchMap, take } from 'rxjs/operators';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.auth.getToken()).pipe(
      switchMap((token) => {
        const headers = request.headers
          .set('Authorization', 'Bearer ' + token)
          .append('Content-Type', 'application/json');
        const requestClone = request.clone({
          headers,
        });
        return next.handle(requestClone);
      }),
      retryWhen((errors: Observable<any>) =>
        errors.pipe(
          mergeMap((error, index) => {
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
