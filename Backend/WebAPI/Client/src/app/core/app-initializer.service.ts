import { Injectable } from '@angular/core';
import { SignalRService } from './signal-r.service';
import { NavigatorService } from './navigator.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  constructor(
    private signalRService: SignalRService,
    private navigatorService: NavigatorService,
  ) {}

  async init(): Promise<void> {
    await this.signalRService.init();
    await this.navigatorService.init();
  }
}
