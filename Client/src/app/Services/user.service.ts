import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { User } from '../Models/User/User';
import { FullUser } from '../Models/User/FullUser';
import { Background } from '../Models/User/Background';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  // User
  public Get() {
    return this.httpClient.get<User>(`${environment.nootsAPI + '/api/user'}`);
  }
  public GetFull() {
    return this.httpClient.get<FullUser>(`${environment.nootsAPI + '/api/user/full'}`);
  }
  public GetUpdates() {
    return this.httpClient.get(`${environment.nootsAPI + '/api/user/update'}`);
  }
  public CreateUser(user: User) {
    return this.httpClient.post<User>(`${environment.nootsAPI + '/api/user'}`, user, this.httpOptions);
  }
  public UpdatePhoto(photo: FormData) {
    return this.httpClient.post(`${environment.nootsAPI + '/api/user/photo'}`, photo, {responseType: 'text'});
  }
  public UpdateName(name: string) {
    const newName = JSON.stringify(name);
    return this.httpClient.post(`${environment.nootsAPI + '/api/user/name'}`, newName, this.httpOptions);
  }

  // BackGrounds
  public NewBackgroundPhoto(photo: FormData) {
    return this.httpClient.post<Background>(`${environment.nootsAPI + '/api/user/background'}`, photo);
  }
  public deleteBackground(id: number) {
    return this.httpClient.delete(`${environment.nootsAPI}` + `/api/user/background/${id}`);
  }
  public changeBackground(id: number) {
    return this.httpClient.get(`${environment.nootsAPI}` + `/api/user/background/${id}`, this.httpOptions);
  }
  public changeToDefaultBackground() {
    return this.httpClient.get(`${environment.nootsAPI}` + `/api/user/background/default`, this.httpOptions);
  }
}
