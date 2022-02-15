import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChangeColorFolder, UpdateFolderTitle } from '../content/folders/state/folders-actions';
import {
  AddLabelOnNote,
  ChangeColorNote,
  LoadOnlineUsersOnNote,
  RemoveLabelFromNote,
  UpdateNoteTitle,
} from '../content/notes/state/notes-actions';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';
import { AuthService } from './auth.service';
import { UpdaterEntitiesService } from './entities-updater.service';
import { UpdateAudiosCollectionWS } from './models/signal-r/innerNote/update-audios-collection-ws';
import { UpdateDocumentsCollectionWS } from './models/signal-r/innerNote/update-documents-collection-ws';
import { UpdateNoteStructureWS } from './models/signal-r/innerNote/update-note-structure-ws';
import { UpdateNoteTextWS } from './models/signal-r/innerNote/update-note-text-ws';
import { UpdatePhotosCollectionWS } from './models/signal-r/innerNote/update-photos-collection-ws';
import { UpdateVideosCollectionWS } from './models/signal-r/innerNote/update-videos-collection-ws';
import { UpdateFolderWS } from './models/signal-r/update-folder-ws';
import { UpdateNoteWS } from './models/signal-r/update-note-ws';
import { LoadNotifications } from './stateApp/app-action';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;

  public updateTextContentEvent = new BehaviorSubject<UpdateNoteTextWS>(null);

  public updateNoteStructureEvent = new BehaviorSubject<UpdateNoteStructureWS>(null);

  public updatePhotosCollectionEvent = new BehaviorSubject<UpdatePhotosCollectionWS>(null);

  public updateVideosCollectionEvent = new BehaviorSubject<UpdateVideosCollectionWS>(null);

  public updateAudiosCollectionEvent = new BehaviorSubject<UpdateAudiosCollectionWS>(null);

  public updateDocumentsCollectionEvent = new BehaviorSubject<UpdateDocumentsCollectionWS>(null);

  public setAsJoinedToNote = new BehaviorSubject(null);

  public setAsJoinedToFolder = new BehaviorSubject(null);

  constructor(
    private readonly store: Store,
    private readonly updaterEntitiesService: UpdaterEntitiesService,
    private readonly auth: AuthService,
  ) {}

  init() {
    this.startConnection();
  }

  private startConnection = async () => {
    const token = await this.auth.getToken();
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .configureLogging(signalR.LogLevel.None)
      .withUrl(`${environment.writeAPI}/hub`, { accessTokenFactory: () => token })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log(`Error while starting connection: ${err}`));

    this.hubConnection.on('newNotification', () => this.store.dispatch(LoadNotifications));

    this.hubConnection.on('updateOnlineUsersNote', (noteId: string) => {
      this.store.dispatch(new LoadOnlineUsersOnNote(noteId)); // TODO REFACTOR BY ONE USER
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.hubConnection.on('updateOnlineUsersFolder', (folderId: string) => {
      // TODO
    });

    this.hubConnection.on('updateNotesGeneral', (updates: UpdateNoteWS) => {
      if (updates.color) {
        this.store.dispatch(new ChangeColorNote(updates.color, [updates.noteId], false));
      }
      if (updates.title) {
        this.store.dispatch(new UpdateNoteTitle(updates.title, updates.noteId, false));
      }
      if (updates.addLabels && updates.addLabels.length > 0) {
        updates.addLabels.forEach((label) => {
          this.store.dispatch(new AddLabelOnNote(label, [updates.noteId], false));
        });
      }
      if (updates.removeLabelIds && updates.removeLabelIds.length > 0) {
        updates.removeLabelIds.forEach((labelId) => {
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

    // UPDATE CONTENT
    this.hubConnection.on('updateTextContent', (updates: UpdateNoteTextWS) => {
      this.updateTextContentEvent.next(updates);
    });

    this.hubConnection.on('updateNoteStructure', (updates: UpdateNoteStructureWS) => {
      this.updateNoteStructureEvent.next(updates);
    });

    // FILES
    this.hubConnection.on('updateDocumentsCollection', (updates: UpdateDocumentsCollectionWS) => {
      this.updateDocumentsCollectionEvent.next(updates);
    });

    this.hubConnection.on('updateAudiosCollection', (updates: UpdateAudiosCollectionWS) => {
      this.updateAudiosCollectionEvent.next(updates);
    });

    this.hubConnection.on('updateVideosCollection', (updates: UpdateVideosCollectionWS) => {
      this.updateVideosCollectionEvent.next(updates);
    });

    this.hubConnection.on('updatePhotosCollection', (updates: UpdatePhotosCollectionWS) => {
      this.updatePhotosCollectionEvent.next(updates);
    });

    // JOINER
    this.hubConnection.on('setJoinedToNote', (noteId: string) => {
      this.setAsJoinedToNote.next(noteId);
    });

    this.hubConnection.on('setJoinedToFolder', (folderId: string) => {
      this.setAsJoinedToFolder.next(folderId);
    });
  };
}
