import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EntityRef } from '../shared/models/entityRef';
import { FolderType } from '../shared/models/folderType';
import { FontSize } from '../shared/models/FontSize';
import { GeneralApp } from '../shared/models/generalApp';
import { LanguageDTO } from '../shared/models/LanguageDTO';
import { NoteType } from '../shared/models/noteType';
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

  getRefs() {
    return this.httpClient.get<EntityRef[]>(environment.writeAPI + '/api/app/refs');
  }

  getNoteTypes() {
    return this.httpClient.get<NoteType[]>(environment.writeAPI + '/api/app/noteTypes');
  }

  getFolderTypes() {
    return this.httpClient.get<FolderType[]>(environment.writeAPI + '/api/app/folderTypes');
  }

  getLoadGeneral()
  {
    return this.httpClient.get<GeneralApp>(environment.writeAPI + '/api/app/general');
  }

}
