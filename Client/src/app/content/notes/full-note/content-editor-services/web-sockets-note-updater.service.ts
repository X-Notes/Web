import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { takeUntil } from 'rxjs/operators';
import { SignalRService } from 'src/app/core/signal-r.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';

@Injectable()
export class WebSocketsNoteUpdaterService implements OnDestroy {
  isJoined = false;

  interval: NodeJS.Timeout;

  noteId: string;

  attempts = 5;

  constructor(private signalRService: SignalRService, private d: DestroyComponentService) {
    this.signalRService.setAsJoinedToNote$
      .pipe(takeUntil(this.d.d$))
      .subscribe((noteId: string) => {
        if (this.noteId === noteId) {
          clearInterval(this.interval);
          this.isJoined = true;
        }
      });
  }

  tryJoinToNote(noteId: string) {
    this.noteId = noteId;
    this.interval = setInterval(async () => {
      if (this.signalRService.hubConnection.state === HubConnectionState.Connected) {
        try {
          await this.signalRService.hubConnection.invoke('JoinNote', noteId);
        } catch (err) {
          console.error(err);
        }
      }
    }, 2000);
  }

  async leaveNote(noteId: string) {
    try {
      await this.signalRService.hubConnection.invoke('LeaveNote', noteId);
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.noteId = null;
    this.isJoined = false;
  }
}
