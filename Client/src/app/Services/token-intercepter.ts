import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';

@Injectable()
export class TokenIntercepter {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = JSON.parse(localStorage.getItem('idKey'));
        if (token) {
            console.log('go');
            req = req.clone({setHeaders: {Authorization: `Bearer ${token}`}});
        }
        return next.handle(req);

    }
}
