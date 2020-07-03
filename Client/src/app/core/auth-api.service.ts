import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface Token {
  token: string;
}

@Injectable()
export class AuthAPIService {

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

}
