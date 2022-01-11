import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChangeColorFolder, UpdateFolderTitle } from '../content/folders/state/folders-actions';
import {
  AddLabelOnNote,
  ChangeColorNote,
  LoadOnlineUsersOnNote,
  RemoveLabelFromNote,
  UpdateNoteTitle,
} from '../content/notes/state/notes-actions';
import { NoteStore } from '../content/notes/state/notes-state';
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

    this.hubConnection.on('updateNotesGeneral', (updates: UpdateNoteWS) => {
      if (updates.color) {
        this.store.dispatch(new ChangeColorNote(updates.color, [updates.noteId], false));
      }
      if (updates.title) {
        this.store.dispatch(new UpdateNoteTitle(updates.title, updates.noteId, false));
      }
      if(updates.addLabels && updates.addLabels.length > 0){
        updates.addLabels.forEach(label => {
          this.store.dispatch(new AddLabelOnNote(label, [updates.noteId], false));
        });
      }
      if(updates.removeLabelIds && updates.removeLabelIds.length > 0) {
        updates.removeLabelIds.forEach(labelId => {
          this.store.dispatch(new RemoveLabelFromNote(labelId, [updates.noteId], false));
        });
      }

      //
      const result = new UpdateNoteUI();
      result.id = updates.noteId;
      result.title = updates.title;
      result.color = updates.color;
      result.removeLabelIds = updates.removeLabelIds;
      result.addLabels = updates.addLabels;
      //
      this.updaterEntitiesService.updateNotesInFolder$.next([result]);
    });

    this.hubConnection.on('updateFoldersGeneral', (updates: UpdateFolderWS) => {
      if (updates.color) {
        this.store.dispatch(new ChangeColorFolder(updates.color, [updates.folderId], false));
      }
      if (updates.title) {
        this.store.dispatch(new UpdateFolderTitle(updates.title, updates.folderId, false));
      }
    });

    this.hubConnection.on('updateNoteContent', () => {
      this.updateContentEvent.next();
    });
  };
}
