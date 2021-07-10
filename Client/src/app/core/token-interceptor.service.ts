import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { AppStore } from './stateApp/app-state';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.store.selectSnapshot(AppStore.getToken);
    let request = req;
    if (!request.url.includes('google') && !request.url.includes('blob.core')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          //  console.log('event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        const data = {
          reason: error && error.error && error.error.reason ? error.error.reason : '',
          status: error.status,
        };
        console.log(data);
        return throwError(error);
      }),
    );
  }
}
