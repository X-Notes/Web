import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiFoldersService } from '../content/folders/api-folders.service';
import { SmallFolder } from '../content/folders/models/folder.model';
import {
  AddFolders,
  ChangeColorFolder,
  DeleteFoldersPermanently,
  UpdateFolderTitle,
} from '../content/folders/state/folders-actions';
import { ApiServiceNotes } from '../content/notes/api-notes.service';
import { SmallNote } from '../content/notes/models/small-note.model';
import {
  AddLabelOnNote,
  AddNotes,
  ChangeColorNote,
  DeleteNotesPermanently,
  LoadOnlineUsersOnNote,
  RemoveLabelFromNote,
  UpdateNoteTitle,
} from '../content/notes/state/notes-actions';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';
import { EntityType } from '../shared/enums/entity-types.enum';
import { FolderTypeENUM } from '../shared/enums/folder-types.enum';
import { NoteTypeENUM } from '../shared/enums/note-types.enum';
import { SnackbarService } from '../shared/services/snackbar/snackbar.service';
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
import { AppStore } from './stateApp/app-state';
import { UserStore } from './stateUser/user-state';

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

  public addNotesToSharedEvent = new BehaviorSubject<SmallNote[]>(null);

  public addFoldersToSharedEvent = new BehaviorSubject<SmallFolder[]>(null);

  public wsConnectionClosed = new Subject<boolean>();

  constructor(
    private store: Store,
    private updaterEntitiesService: UpdaterEntitiesService,
    private apiFolders: ApiFoldersService,
    private apiNotes: ApiServiceNotes,
    private snackbarService: SnackbarService,
    private readonly translateService: TranslateService,
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
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log(`Error while starting connection: ${err}`));

    this.hubConnection.onclose(() => {
      this.wsConnectionClosed.next(true);
      const message = this.translateService.instant('snackBar.reloadPage');
      this.snackbarService.openSnackBar(message, null, null, Infinity);
    });

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

    // Note permissions

    this.hubConnection.on('revokeNotePermissions', (noteId: string) => {
      this.store.dispatch(new DeleteNotesPermanently([noteId], false));
    });

    this.hubConnection.on('addNoteToShared', async (noteId: string) => {
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const notes = await this.apiNotes.getNotesMany([noteId], pr).toPromise();
      await this.store.dispatch(new AddNotes(notes, NoteTypeENUM.Shared)).toPromise();
      const route = this.store.selectSnapshot(AppStore.getRouting);
      if (route === EntityType.NoteShared) {
        this.addNotesToSharedEvent.next(notes);
      }
    });

    // Folder permissions

    this.hubConnection.on('revokeFolderPermissions', (folderId: string) => {
      this.store.dispatch(new DeleteFoldersPermanently([folderId], false));
    });

    this.hubConnection.on('addFolderToShared', async (folderId: string) => {
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const folders = await this.apiFolders.getFoldersMany([folderId], pr).toPromise();
      await this.store.dispatch(new AddFolders(folders, FolderTypeENUM.Shared)).toPromise();
      const route = this.store.selectSnapshot(AppStore.getRouting);
      if (route === EntityType.FolderShared) {
        this.addFoldersToSharedEvent.next(folders);
      }
    });
  };
}
