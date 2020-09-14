import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Background } from 'src/app/core/models/background';

@Injectable()
export class BackgroundService {

  constructor(private httpClient: HttpClient) { }

  getBackgrounds() {
     return this.httpClient.get<Background[]>(environment.writeAPI + '/api/backgrounds');
  }

  newBackground(photo: FormData) {
    return this.httpClient.post<Background>(environment.writeAPI + '/api/backgrounds/new', photo);
  }

  setBackground(id: number) {
    return this.httpClient.get(environment.writeAPI + `/api/backgrounds/background/${id}`);
  }

  removeBackground(id: number) {
    return this.httpClient.delete(environment.writeAPI + `/api/backgrounds/background/${id}`);
  }

  defaultBackground() {
    return this.httpClient.get(environment.writeAPI + '/api/backgrounds/background/default');
  }
}
