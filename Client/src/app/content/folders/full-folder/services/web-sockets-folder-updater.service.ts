import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { takeUntil } from 'rxjs/operators';
import { JoinEntityStatus } from 'src/app/core/models/signal-r/join-enitity-status';
import { SignalRService } from 'src/app/core/signal-r.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';

@Injectable()
export class WebSocketsFolderUpdaterService implements OnDestroy {
  isJoined = false;

  interval: NodeJS.Timeout;

  folderId: string;

  constructor(private signalRService: SignalRService, private d: DestroyComponentService) {
    this.signalRService.setAsJoinedToFolder$
      .pipe(takeUntil(this.d.d$))
      .subscribe((ent: JoinEntityStatus) => this.handleJoin(ent));
  }

  tryJoinToFolder(folderId: string) {
    this.folderId = folderId;
    let attempts = 5;
    this.interval = setInterval(async () => {
      if (this.signalRService.hubConnection.state !== HubConnectionState.Connected) return;
      if (attempts === 0) {
        if (this.interval) {
          clearInterval(this.interval);
        }
        return;
      }
      attempts--;
      await this.handleConnect(folderId);
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
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.folderId = null;
    this.isJoined = false;
  }

  private async handleConnect(folderId: string): Promise<void> {
    try {
      await this.signalRService.hubConnection.invoke('JoinFolder', folderId);
    } catch (err) {
      console.error(err);
    }
  }

  private handleJoin(ent: JoinEntityStatus): void {
    if (this.folderId !== ent.entityId) return;
    if (ent.joined) {
      this.isJoined = true;
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
