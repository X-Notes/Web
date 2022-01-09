import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChangeColorFolder, UpdateFolderTitle } from '../content/folders/state/folders-actions';
import {
  ChangeColorNote,
  LoadOnlineUsersOnNote,
  UpdateNoteTitle,
} from '../content/notes/state/notes-actions';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';
import { UpdaterEntitiesService } from './entities-updater.service';
import { UpdateFolderWS } from './models/signal-r/update-folder-ws';
import { UpdateNoteWS } from './models/signal-r/update-note-ws';
import { LoadNotifications } from './stateApp/app-action';
import { AppStore } from './stateApp/app-state';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;

  public updateContentEvent = new Subject();

  constructor(private store: Store, private updaterEntitiesService: UpdaterEntitiesService) {}

  init() {
    this.startConnection();
  }

  async joinNote(noteId: string) {
    try {
      await this.hubConnection.invoke('JoinNote', noteId);
    } catch (err) {
      console.error(err);
    }
  }

  async leaveNote(noteId: string) {
    try {
      await this.hubConnection.invoke('LeaveNote', noteId);
    } catch (err) {
      console.error(err);
    }
  }

  private startConnection = () => {
    const token = this.store.selectSnapshot(AppStore.getToken);
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .configureLogging(signalR.LogLevel.None)
      .withUrl(`${environment.writeAPI}/hub`, { accessTokenFactory: () => token })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log(`Error while starting connection: ${err}`));

    this.hubConnection.on('newNotification', () => this.store.dispatch(LoadNotifications));

    this.hubConnection.on('updateOnlineUsers', (noteId: string) => {
      this.store.dispatch(new LoadOnlineUsersOnNote(noteId));
    });

    this.hubConnection.on('updateNotesGeneral', (updates: UpdateNoteWS[]) => {
      updates.forEach((item) => {
        if (item.color) {
          this.store.dispatch(new ChangeColorNote(item.color, [item.noteId], false));
        }
        if (item.title) {
          this.store.dispatch(new UpdateNoteTitle(item.title, item.noteId, false));
        }
      });
      const updateNotesInFolder = updates.map((item) => {
        const result = new UpdateNoteUI();
        result.id = item.noteId;
        result.title = item.title;
        result.color = item.color;
        result.labels = item.labels;
        return result;
      });
      this.updaterEntitiesService.updateNotesInFolder$.next(updateNotesInFolder);
    });

    this.hubConnection.on('updateFoldersGeneral', (updates: UpdateFolderWS[]) => {
      updates.forEach((item) => {
        if (item.color) {
          this.store.dispatch(new ChangeColorFolder(item.color, [item.folderId], false));
        }
        if (item.title) {
          this.store.dispatch(new UpdateFolderTitle(item.title, item.folderId, false));
        }
      });
    });

    this.hubConnection.on('updateNoteContent', () => {
      this.updateContentEvent.next();
    });
  };
}
