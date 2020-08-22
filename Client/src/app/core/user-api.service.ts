import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { User } from './models/user';
import { ShortUser } from './models/short-user';
import { Theme } from '../shared/enums/Theme';
import { FontSize } from '../shared/enums/FontSize';

export interface Token {
  token: string;
}

@Injectable()
export class UserAPIService {

  constructor(private httpClient: HttpClient) { }

  verifyToken(token: string) {
    const value: Token = {
      token
    };
    return this.httpClient.post(environment.writeAPI + '/api/auth/verify', value);
  }

  tryGetFromAuthorize() {
    return this.httpClient.get(environment.writeAPI + '/api/auth/get');
  }

  newUser(user: User) {
    return this.httpClient.post<ShortUser>(environment.writeAPI + '/api/user' , user);
  }

  getUser() {
    return this.httpClient.get<ShortUser>(environment.writeAPI + '/api/user/short');
  }

  changeTheme(theme: Theme) {
    const obj = {
      theme
    };
    return this.httpClient.post(environment.writeAPI + '/api/user/theme' , obj);
  }

  changeFontSize(fontSize: FontSize) {
    const obj = {
      fontSize
    };
    return this.httpClient.post(environment.writeAPI + '/api/user/font' , obj);
  }

}
