import { Injectable, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { JoinEntityStatus } from 'src/app/core/models/signal-r/join-enitity-status';
import { SignalRService } from 'src/app/core/signal-r.service';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { CustomSnackbarComponent } from 'src/app/shared/snackbars/custom-snackbar/custom-snackbar.component';
import { UpdateFullFolder } from '../../state/folders-actions';

@Injectable()
export class WebSocketsFolderUpdaterService implements OnDestroy {
  isJoined = false;

  interval: NodeJS.Timeout;

  folderId: string;

  isReconnected = false;

  private onSnackBarReconnect: MatSnackBarRef<CustomSnackbarComponent>;

  private onSnackBarReconnected: MatSnackBarRef<CustomSnackbarComponent>;
  
  private onMaxUsersOnFolderSnackbar: MatSnackBarRef<CustomSnackbarComponent>;

  constructor(
    private translate: TranslateService,
    private signalRService: SignalRService,
    private snackbarService: SnackbarService,
    private store: Store) {
    this.signalRService.setAsJoinedToFolder$
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
        this.tryJoinToFolder(this.folderId);
      });
  }

  tryJoinToFolder(folderId: string) {
    this.folderId = folderId;
    let attempts = 5;
    this.interval = setInterval(async () => {
      if (!this.signalRService.isConnected) return;
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
      await this.signalRService.invoke('LeaveFolder', folderId);
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
    this.onSnackBarReconnect?.dismiss();
    this.onSnackBarReconnected?.dismiss();
    this.onMaxUsersOnFolderSnackbar?.dismiss();
  }

  private async handleConnect(folderId: string): Promise<void> {
    try {
      await this.signalRService.invoke('JoinFolder', folderId);
    } catch (err) {
      console.error(err);
    }
  }

  private handleJoin(ent: JoinEntityStatus): void {
    if (this.folderId !== ent.entityId) return;
    if (ent.result.success) {
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
