import { Injectable } from '@angular/core';
import { GlobalEventsService } from './global-events.service';
import { SignalRService } from './signal-r.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  constructor(
    private signalRService: SignalRService,
    private globalEventsService: GlobalEventsService,
  ) {}

  async init(): Promise<void> {
    await this.signalRService.init();
    await this.globalEventsService.init();
  }
}
