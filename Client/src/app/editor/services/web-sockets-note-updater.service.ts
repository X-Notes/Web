import { Injectable, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { HubConnectionState } from '@microsoft/signalr';
import { TranslateService } from '@ngx-translate/core';
import { JoinEntityStatus } from 'src/app/core/models/signal-r/join-enitity-status';
import { SignalRService } from 'src/app/core/signal-r.service';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { CustomSnackbarComponent } from 'src/app/shared/snackbars/custom-snackbar/custom-snackbar.component';

@Injectable()
export class WebSocketsNoteUpdaterService implements OnDestroy {
  isJoined = false;

  interval: NodeJS.Timeout;

  noteId: string;

  isReconnected = false;

  private onSnackBarReconnect: MatSnackBarRef<CustomSnackbarComponent>;

  private onSnackBarReconnected: MatSnackBarRef<CustomSnackbarComponent>;

  constructor(
    private translate: TranslateService,
    private signalRService: SignalRService,
    private snackbarService: SnackbarService) {
    this.signalRService.setAsJoinedToNote$
      .pipe(takeUntilDestroyed())
      .subscribe((ent: JoinEntityStatus) => this.handleJoin(ent));
    this.signalRService.onReconnecting$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const message = this.translate.instant('snackBar.reconnection');
        this.onSnackBarReconnect = this.snackbarService.openSnackBarFromComponent(CustomSnackbarComponent, message, true, null, Infinity);
      });
    this.signalRService.onReconnected$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.isReconnected = true;
        this.tryJoinToNote(this.noteId);
      });
  }

  tryJoinToNote(noteId: string) {
    this.noteId = noteId;
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
      await this.handleConnect(noteId);
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
    this.onSnackBarReconnect?.dismiss();
    this.onSnackBarReconnected?.dismiss();
  }

  private async handleConnect(noteId: string): Promise<void> {
    try {
      await this.signalRService.hubConnection.invoke('JoinNote', noteId);
    } catch (err) {
      console.error(err);
    }
  }

  private handleJoin(ent: JoinEntityStatus): void {
    if (this.noteId !== ent.entityId) return;
    if (ent.joined) {
      this.isJoined = true;
      this.onSnackBarReconnect?.dismiss();
      if (this.isReconnected) {
        this.isReconnected = false;
        const message = this.translate.instant('snackBar.reconnected');
        this.onSnackBarReconnected = this.snackbarService.openSnackBarFromComponent(CustomSnackbarComponent, message, false, null);
      }
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
