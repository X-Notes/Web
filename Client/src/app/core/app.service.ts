import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FontSize } from '../shared/models/FontSize';
import { LanguageDTO } from '../shared/models/Language';
import { Theme } from '../shared/models/Theme';

@Injectable()
export class AppServiceAPI {

  constructor(private httpClient: HttpClient) { }

  getLanguages(): Observable<LanguageDTO[]> {
    return this.httpClient.get<LanguageDTO[]>(environment.writeAPI + '/api/app/languages');
  }

  getThemes(): Observable<Theme[]>  {
    return this.httpClient.get<Theme[]>(environment.writeAPI + '/api/app/themes');
  }

  getFontSizes() {
    return this.httpClient.get<FontSize[]>(environment.writeAPI + '/api/app/fontSizes');
  }

}
