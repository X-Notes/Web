import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LanguageDTO } from '../shared/enums/Language';

@Injectable()
export class AppServiceAPI {

  constructor(private httpClient: HttpClient) { }

  getLanguages() {
    return this.httpClient.get<LanguageDTO[]>(environment.writeAPI + '/api/app/languages');
  }
}
