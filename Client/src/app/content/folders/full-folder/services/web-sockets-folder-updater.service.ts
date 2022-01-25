import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@aspnet/signalr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignalRService } from 'src/app/core/signal-r.service';

@Injectable()
export class WebSocketsFolderUpdaterService implements OnDestroy {

  isJoined = false;

  destroy = new Subject<void>();
  
  interval: NodeJS.Timeout;
  
  folderId: string;

  constructor(private signalRService: SignalRService) {
    this.signalRService.setAsJoinedToFolder
    .pipe(takeUntil(this.destroy))
    .subscribe((folderId: string) => {
      if(this.folderId === folderId) {
        clearInterval(this.interval);
        this.isJoined = true;
      }
    })
   }

  tryJoinToFolder(folderId: string) {
    this.folderId = folderId;
    this.interval = setInterval(async () => {
      if(this.signalRService.hubConnection.state === HubConnectionState.Connected){
        try {
          await this.signalRService.hubConnection.invoke('JoinFolder', folderId);
        } catch (err) {
          console.error(err);
        }
      }
    }, 2000);
  }

  async leaveFolder(folderId: string) {
    try {
      await this.signalRService.hubConnection.invoke('LeaveFolder', folderId);
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy(): void {
    if(this.interval){
      clearInterval(this.interval);
    }
    this.folderId = null;
    this.isJoined = false;
    this.destroy.next();
    this.destroy.complete();
  }
}
