import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PersonalizationSetting } from './models/personalization-setting.model';

@Injectable()
export class ApiPersonalizationSettingsService {
  constructor(private httpClient: HttpClient) {}

  getPersonalizationSettings() {
    return this.httpClient.get<PersonalizationSetting>(
      `${environment.writeAPI}/api/personalization`,
    );
  }

  updateUserPersonalizationSettings(settings: PersonalizationSetting) {
    const obj = {
      personalizationSetting: settings,
    };

    return this.httpClient.patch<PersonalizationSetting>(
      `${environment.writeAPI}/api/personalization`,
      obj,
    );
  }
}
