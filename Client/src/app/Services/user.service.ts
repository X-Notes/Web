import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { User } from '../Models/User/User';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  public Get() {
    return this.httpClient.get<User>(`${environment.nootsAPI + '/api/user'}`);
  }
  public CreateUser(user: User) {
    return this.httpClient.post<User>(`${environment.nootsAPI + '/api/user'}`, user, this.httpOptions);
  }
}
