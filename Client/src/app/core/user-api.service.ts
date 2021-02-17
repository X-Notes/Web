import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from './models/user';
import { ShortUser } from './models/short-user';
import { Theme } from '../shared/enums/Theme';
import { FontSize } from '../shared/enums/FontSize';
import { Language } from '../shared/enums/Language';
import { AnswerChangePhoto } from './models/asnwer-change-photo';

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

  changeLanguage(language: Language) {
    const obj = {
      language
    };
    return this.httpClient.post(environment.writeAPI + '/api/user/language' , obj);
  }

  updateUserName(name: string) {
    const obj = {
      name
    };
    return this.httpClient.put(environment.writeAPI + '/api/user/username' , obj);
  }

  updateUserPhoto(photo: FormData) {
    return this.httpClient.post<AnswerChangePhoto>(environment.writeAPI + '/api/user/photo', photo);
  }

  async getImageFromGoogle(imageUrl): Promise<FormData> {
    const imageBlob = await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
    const form = new FormData();
    form.append('Photo', imageBlob);
    return form;
  }

  private async getBase64FromBlob(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve('data:image/jpeg;base64,' + base64);
      };
      reader.readAsDataURL(blob);
    });
  }

}
