import { Injectable } from '@angular/core';
import { SignalRService } from './signal-r.service';
import { NavigatorService } from './navigator.service';
import { IndexDbService } from './indexDb/index-db.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  constructor(
    private signalRService: SignalRService,
    private navigatorService: NavigatorService,
    private indexDbService: IndexDbService,
  ) {}

  async init(): Promise<void> {
    await this.signalRService.init();
    await this.navigatorService.init();
    this.indexDbService.openNotes();
  }
}
