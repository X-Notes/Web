/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Subject, from } from 'rxjs';
import { filter, take } from 'rxjs/operators'
import { environment } from 'src/environments/environment';

export const InterceptorSkipToken = 'X-Skip-Token';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {

  static isRefreshing = false;

  static isRefreshed$ = new Subject<boolean>();

  constructor(private readonly auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return from(this.handle(request, next));
  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    try {
      const res = await next.handle(this.mutateRequest(req)).toPromise();
      return res;
    } catch (e) {
      console.error(e);
      const codes = [401, 403];
      if (codes.some(x => x === e.status)) {
        if (TokenInterceptorService.isRefreshing) {
          await TokenInterceptorService.isRefreshed$.pipe(filter(x => !!x), take(1)).toPromise();
          return await next.handle(this.mutateRequest(req)).toPromise();
        }
        TokenInterceptorService.isRefreshing = true;
        const isRefreshed = await this.handleError();
        TokenInterceptorService.isRefreshing = false;
        if (isRefreshed) {
          TokenInterceptorService.isRefreshed$.next(true);
          return await next.handle(this.mutateRequest(req)).toPromise();
        }
        this.auth.logout();
      }
      return e;
    }
  }

  private mutateRequest(request: HttpRequest<any>): HttpRequest<any> {
    const isApiUrl = request.url.startsWith(environment.api);
    if (isApiUrl) {
      const token = this.auth.getAccessToken();
      if(token) {
        return request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
    }
    return request;
  }

  private async handleError() {
    for (let i = 0; i < 2; i++) {
      const isRefreshed = await this.auth.refresh();
      if (isRefreshed) {
        return true;
      }
    }
    return false;
  }
}
