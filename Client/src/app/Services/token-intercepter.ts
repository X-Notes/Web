import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenIntercepter {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = (localStorage.getItem('idKey'));
        if (token) {
            req = req.clone({setHeaders: {Authorization: `Bearer ${token}`}});
        }
        return next.handle(req);

    }
}
