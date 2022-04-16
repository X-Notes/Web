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
  UpdateOneFolder,
} from '../content/folders/state/folders-actions';
import { FolderStore } from '../content/folders/state/folders-state';
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
  UpdateOneNote,
} from '../content/notes/state/notes-actions';
import { NoteStore } from '../content/notes/state/notes-state';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';
import { EntityType } from '../shared/enums/entity-types.enum';
import { FolderTypeENUM } from '../shared/enums/folder-types.enum';
import { NoteTypeENUM } from '../shared/enums/note-types.enum';
import { RefTypeENUM } from '../shared/enums/ref-type.enum';
import { SnackbarService } from '../shared/services/snackbar/snackbar.service';
import { AuthService } from './auth.service';
import { UpdaterEntitiesService } from './entities-updater.service';
import { UpdateAudiosCollectionWS } from './models/signal-r/innerNote/update-audios-collection-ws';
import { UpdateDocumentsCollectionWS } from './models/signal-r/innerNote/update-documents-collection-ws';
import { UpdateNoteStructureWS } from './models/signal-r/innerNote/update-note-structure-ws';
import { UpdateNoteTextWS } from './models/signal-r/innerNote/update-note-text-ws';
import { UpdatePhotosCollectionWS } from './models/signal-r/innerNote/update-photos-collection-ws';
import { UpdateVideosCollectionWS } from './models/signal-r/innerNote/update-videos-collection-ws';
import { UpdatePermissionFolder } from './models/signal-r/permissions/update-permission-folder';
import { UpdatePermissionNote } from './models/signal-r/permissions/update-permission-note';
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
      const result = new UpdateNoteUI(updates.noteId);
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

    this.hubConnection.on(
      'updatePermissionUserNote',
      async (updatePermissionNote: UpdatePermissionNote) => {
        if (updatePermissionNote.revokeIds && updatePermissionNote.revokeIds.length > 0) {
          this.store.dispatch(new DeleteNotesPermanently(updatePermissionNote.revokeIds, false));
        }
        const idsToAdd = updatePermissionNote.idsToAdd;
        if (idsToAdd && idsToAdd.length > 0) {
          const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
          const notes = await this.apiNotes.getNotesMany(idsToAdd, pr).toPromise();
          await this.store.dispatch(new AddNotes(notes, NoteTypeENUM.Shared)).toPromise();
          const route = this.store.selectSnapshot(AppStore.getRouting);
          if (route === EntityType.NoteShared) {
            this.addNotesToSharedEvent.next(notes);
          }
        }
        const updatePermissions = updatePermissionNote.updatePermissions;
        for (const update of updatePermissions) {
          let note = this.store
            .selectSnapshot(NoteStore.getSmallNotes)
            .find((z) => z.id === update.entityId);
          note = { ...note };
          note.refTypeId = update.refTypeId;
          note.isCanEdit = note.refTypeId === RefTypeENUM.Editor;
          this.store.dispatch(new UpdateOneNote(note));
        }
        this.store.dispatch(LoadNotifications);
      },
    );

    // Folder permissions

    this.hubConnection.on(
      'updatePermissionUserFolder',
      async (updatePermissionFolder: UpdatePermissionFolder) => {
        if (updatePermissionFolder.revokeIds && updatePermissionFolder.revokeIds.length > 0) {
          this.store.dispatch(
            new DeleteFoldersPermanently(updatePermissionFolder.revokeIds, false),
          );
        }
        const idsToAdd = updatePermissionFolder.idsToAdd;
        if (idsToAdd && idsToAdd.length > 0) {
          const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
          const folders = await this.apiFolders.getFoldersMany(idsToAdd, pr).toPromise();
          await this.store.dispatch(new AddFolders(folders, FolderTypeENUM.Shared)).toPromise();
          const route = this.store.selectSnapshot(AppStore.getRouting);
          if (route === EntityType.FolderShared) {
            this.addFoldersToSharedEvent.next(folders);
          }
        }
        const updatePermissions = updatePermissionFolder.updatePermissions;
        for (const update of updatePermissions) {
          let folder = this.store
            .selectSnapshot(FolderStore.getSmallFolders)
            .find((z) => z.id === update.entityId);
          folder = { ...folder };
          folder.refTypeId = update.refTypeId;
          folder.isCanEdit = folder.refTypeId === RefTypeENUM.Editor;
          this.store.dispatch(new UpdateOneFolder(folder));
        }
        this.store.dispatch(LoadNotifications);
      },
    );
  };
}
