import { Injectable } from '@angular/core';
import { NewUser } from '../Models/User/newUser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  public Get(user: NewUser) {
    return this.httpClient.post(`${environment.nootsAPI + '/api/user'}`, user, this.httpOptions);
  }
}
