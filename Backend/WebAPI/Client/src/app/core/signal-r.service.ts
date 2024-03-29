import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiFoldersService } from '../content/folders/api-folders.service';
import { SmallFolder } from '../content/folders/models/folder.model';
import {
  AddFolders,
  ChangeColorFolder,
  DeleteFoldersPermanently,
  PatchUpdatesUIFolders,
  UpdateFolderTitle,
  UpdateFullFolder,
  UpdateOneFolder,
} from '../content/folders/state/folders-actions';
import { UpdateFolderUI } from '../content/folders/state/update-folder-ui.model';
import { ApiServiceNotes } from '../content/notes/api-notes.service';
import { SmallNote } from '../content/notes/models/small-note.model';
import {
  AddLabelOnNote,
  AddNotes,
  AddToDomNotes,
  ChangeColorNote,
  DeleteNotesPermanently,
  LoadOnlineUsersOnNote,
  PatchUpdatesUINotes,
  RemoveLabelFromNote,
  RemoveOnlineUsersOnNote,
  UpdateFullNote,
  UpdateNoteTitleWS,
  UpdateNotes,
  UpdateOneNote,
} from '../content/notes/state/notes-actions';
import { UpdateNoteUI } from '../content/notes/state/update-note-ui.model';
import { EntityType } from '../shared/enums/entity-types.enum';
import { FolderTypeENUM } from '../shared/enums/folder-types.enum';
import { NoteTypeENUM } from '../shared/enums/note-types.enum';
import { RefTypeENUM } from '../shared/enums/ref-type.enum';
import { SnackbarService } from '../shared/services/snackbar/snackbar.service';
import { UpdateRelatedNotesWS } from './models/signal-r/innerNote/update-related-notes-ws';
import { UpdateVideosCollectionWS } from '../editor/entities/ws/update-videos-collection-ws';
import { UpdatePermissionFolder } from './models/signal-r/permissions/update-permission-folder';
import { UpdatePermissionNote } from './models/signal-r/permissions/update-permission-note';
import { UpdateFolderWS } from './models/signal-r/update-folder-ws';
import { UpdateNoteWS } from './models/signal-r/update-note-ws';
import { NewNotification, Ping } from './stateApp/app-action';
import { AppStore } from './stateApp/app-state';
import { UserStore } from './stateUser/user-state';
import { pingWSDelay } from './defaults/bounceDelay';
import { UpdateCursorWS } from '../content/notes/state/editor-actions';
import { AppNotification } from './models/notifications/app-notification.model';
import { JoinEntityStatus } from './models/signal-r/join-enitity-status';
import { BaseText } from '../editor/entities/contents/base-text';
import { NoteUserCursorWS } from '../editor/entities/ws/note-user-cursor';
import { UpdateAudiosCollectionWS } from '../editor/entities/ws/update-audios-collection-ws';
import { UpdateDocumentsCollectionWS } from '../editor/entities/ws/update-documents-collection-ws';
import { UpdateEditorStructureWS } from '../editor/entities/ws/update-note-structure-ws';
import { UpdateNoteTextWS } from '../editor/entities/ws/update-note-text-ws';
import { UpdatePhotosCollectionWS } from '../editor/entities/ws/update-photos-collection-ws';
import { ThemeENUM } from '../shared/enums/theme.enum';
import { CopyNoteResult } from '../content/notes/models/copy-note-result';
import { NoteStore } from '../content/notes/state/notes-state';
import { Notes } from '../content/notes/state/notes.model';
import { AddNotesToDom } from '../content/notes/state/add-notes-to-dom.model';
import { LoadUsedDiskSpace } from './stateUser/user-action';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;

  public updateTextContentEvent$ = new Subject<UpdateNoteTextWS>();

  public updateNoteStructureEvent$ = new Subject<UpdateEditorStructureWS>();

  public updatePhotosCollectionEvent$ = new Subject<UpdatePhotosCollectionWS>();

  public updateVideosCollectionEvent$ = new Subject<UpdateVideosCollectionWS>();

  public updateAudiosCollectionEvent$ = new Subject<UpdateAudiosCollectionWS>();

  public updateDocumentsCollectionEvent$ = new Subject<UpdateDocumentsCollectionWS>();

  public updateRelationNotes$ = new Subject<UpdateRelatedNotesWS>();

  public updateFolder$ = new Subject<UpdateFolderWS>();

  public setAsJoinedToNote$ = new Subject<JoinEntityStatus>();

  public setAsJoinedToFolder$ = new Subject<JoinEntityStatus>();

  public addNotesToSharedEvent$ = new Subject<SmallNote[]>();

  public addFoldersToSharedEvent$ = new Subject<SmallFolder[]>();

  public wsConnectionClosed$ = new Subject<boolean>();

  public onReconnecting$ = new Subject<boolean>();

  public onReconnected$ = new Subject<boolean>();

  constructor(
    private store: Store,
    private apiFolders: ApiFoldersService,
    private apiNotes: ApiServiceNotes,
    private snackbarService: SnackbarService,
    private readonly translateService: TranslateService,
    private authService: AuthService,
  ) { }

  get connectionId(): string {
    return this.hubConnection.connectionId;
  }

  get connectionIdOrError(): string {
    if(this.hubConnection.connectionId) {
      return this.hubConnection.connectionId;
    }
    throw new Error('connectionId is null');
  }

  get isConnected(): boolean {
    return this.hubConnection.state === signalR.HubConnectionState.Connected;
  }

  async init() {
    await this.startConnection();
  }

  private ping(): void {
    setInterval(() => {
      try {
        if (this.isConnected && this.authService.isLoggedIn) {
          this.store.dispatch(new Ping(this.connectionIdOrError));
        }
      } catch (e) {
        console.error(e);
      }
    }, pingWSDelay);
  }

  public invoke(methodName: string, arg?: any): void {
    if (arg) {
      this.hubConnection.invoke(methodName, arg);
      return;
    }
    this.hubConnection.invoke(methodName);
  }

  wait = (delay = 0) => {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        resolve(true);
      }, delay),
    );
  };

  async tryStart(time: number) {
    try {
      await this.wait(time);
      await this.hubConnection.start();
      return true;
    } catch (e) {
      console.error('e: ', e);
      return false;
    }
  }

  private startConnection = async () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .configureLogging(signalR.LogLevel.None)
      .withUrl(`${environment.api}/api/hub`, { accessTokenFactory: () => this.authService.getAccessToken() })
      .withAutomaticReconnect()
      .build();

    let isInited = false;

    for (let i = 0; i < 2; i++) {
      const time = i === 0 ? 0 : 100;
      isInited = await this.tryStart(time);
      if (isInited) {
        break;
      }
    }

    if (!isInited) {
      console.error('WS doesn`t inited');
      return;
    }

    this.ping();

    console.log('Connection started');

    this.hubConnection.onreconnecting(() => {
      console.log('onreconnecting');
      this.onReconnecting$.next(true);
    });

    this.hubConnection.onreconnected(() => {
      console.log('onreconnected');
      this.onReconnected$.next(true);
    });

    this.hubConnection.onclose(() => {
      console.log('onclose');
      this.wsConnectionClosed$.next(true);
      const message = this.translateService.instant('snackBar.reloadPage');
      this.snackbarService.openSnackBar(message, null, null, Infinity, ThemeENUM.Light);
    });

    this.hubConnection.on('newNotification', (notification: AppNotification) => {
      const mappedNotification = new AppNotification(notification);
      this.store.dispatch(new NewNotification(mappedNotification));
    });

    this.hubConnection.on('updateOnlineUsersNote', (noteId: string) => {
      this.store.dispatch(new LoadOnlineUsersOnNote(noteId)); // TODO REFACTOR BY ONE USER
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.hubConnection.on('updateOnlineUsersFolder', (folderId: string) => {
      // TODO
    });

    this.hubConnection.on('copyNote', async (result: CopyNoteResult) => {
      const newIds = [result.newId];
      const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
      const newNotes = await this.apiNotes.getNotesMany(newIds, pr.contentInNoteCount).toPromise();
      const privateNotes = this.store.selectSnapshot(NoteStore.getPrivateNotes);
      const command = new UpdateNotes(new Notes(NoteTypeENUM.Private, [...newNotes, ...privateNotes]), NoteTypeENUM.Private);
      await this.store.dispatch(command).toPromise();
      const obj: AddNotesToDom = { type: NoteTypeENUM.Private, notes: [...newNotes] };
      this.store.dispatch([new AddToDomNotes(obj), LoadUsedDiskSpace]);
      if(result.folderId) {
        const obj: UpdateFolderWS = { folderId:result.folderId, idsToAdd: newIds };
        this.updateFolder$.next(obj);
      }
    });

    // REMOVE ONLINE
    this.hubConnection.on(
      'removeOnlineUsersNote',
      (obj: { entityId: string; userIdentifier: string; userId: string }) => {
        const action = new RemoveOnlineUsersOnNote(obj.entityId, obj.userIdentifier, obj.userId);
        this.store.dispatch(action);
      },
    );

    this.hubConnection.on(
      'removeOnlineUsersFolder',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (obj: { entityId: string; userIdentifier: string }) => {
        // TODO
      },
    );

    this.hubConnection.on('updateNoteGeneral', (updates: UpdateNoteWS) => {
      if (updates.color) {
        this.store.dispatch(new ChangeColorNote(updates.color, [updates.noteId], false));
      }
      if (updates.isUpdateTitle) {
        this.store.dispatch(new UpdateNoteTitleWS(updates.title, updates.noteId));
      }
      if (updates.addLabels && updates.addLabels.length > 0) {
        updates.addLabels.forEach((label) => {
          this.store.dispatch(new AddLabelOnNote(label.id, [updates.noteId], false));
        });
      }
      if (updates.removeLabelIds && updates.removeLabelIds.length > 0) {
        updates.removeLabelIds.forEach((labelId) => {
          this.store.dispatch(new RemoveLabelFromNote(labelId, [updates.noteId], false));
        });
      }
    });

    this.hubConnection.on('updateFolderGeneral', (updates: UpdateFolderWS) => {
      if (updates.color) {
        this.store.dispatch(new ChangeColorFolder(updates.color, [updates.folderId], false));
      }
      if (updates.isUpdateTitle) {
        this.store.dispatch(new UpdateFolderTitle(updates.title, updates.folderId).updateWS());
      }
      this.updateFolder$.next(updates);
    });

    // UPDATE CONTENT

    this.hubConnection.on('updateRelatedNotes', (updates: UpdateRelatedNotesWS) => {
      this.updateRelationNotes$.next(updates);
    });

    this.hubConnection.on('updateTextContent', (updates: UpdateNoteTextWS) => {
      updates.collection = new BaseText(updates.collection);
      this.updateTextContentEvent$.next(updates);
    });

    this.hubConnection.on('updateNoteStructure', (updates: UpdateEditorStructureWS) => {
      updates = new UpdateEditorStructureWS(updates);
      this.updateNoteStructureEvent$.next(updates);
    });

    this.hubConnection.on('updateNoteUserCursor', (updates: NoteUserCursorWS) => {
      this.store.dispatch(new UpdateCursorWS(updates));
    });

    // FILES
    this.hubConnection.on('updateDocumentsCollection', (updates: UpdateDocumentsCollectionWS) => {
      this.updateDocumentsCollectionEvent$.next(updates);
    });

    this.hubConnection.on('updateAudiosCollection', (updates: UpdateAudiosCollectionWS) => {
      this.updateAudiosCollectionEvent$.next(updates);
    });

    this.hubConnection.on('updateVideosCollection', (updates: UpdateVideosCollectionWS) => {
      this.updateVideosCollectionEvent$.next(updates);
    });

    this.hubConnection.on('updatePhotosCollection', (updates: UpdatePhotosCollectionWS) => {
      this.updatePhotosCollectionEvent$.next(updates);
    });

    // JOINER
    this.hubConnection.on('setJoinedToNote', (ent: JoinEntityStatus) => {
      this.setAsJoinedToNote$.next(ent);
    });

    this.hubConnection.on('setJoinedToFolder', (ent: JoinEntityStatus) => {
      this.setAsJoinedToFolder$.next(ent);
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
          const notes = await this.apiNotes.getNotesMany(idsToAdd, pr.contentInNoteCount).toPromise();
          await this.store.dispatch(new AddNotes(notes, NoteTypeENUM.Shared)).toPromise();
          const route = this.store.selectSnapshot(AppStore.getRouting);
          if (route === EntityType.NoteShared) {
            this.addNotesToSharedEvent$.next(notes);
          }
        }
        const updatePermissions = updatePermissionNote.updatePermissions;
        const noteUI: UpdateNoteUI[] = [];
        for (const update of updatePermissions) {
          const note = new SmallNote();
          note.id = update.entityId;
          note.refTypeId = update.refTypeId;
          note.isCanEdit = note.refTypeId === RefTypeENUM.Editor;
          this.store.dispatch(new UpdateOneNote(note, note.id));

          // FULL NOTE
          this.store.dispatch(new UpdateFullNote(note, update.entityId));

          // UI
          const updateUINote = new UpdateNoteUI(update.entityId);
          updateUINote.isCanEdit = note.isCanEdit;
          noteUI.push(updateUINote);
        }
        this.store.dispatch(new PatchUpdatesUINotes(noteUI));
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
            this.addFoldersToSharedEvent$.next(folders);
          }
        }
        const updatePermissions = updatePermissionFolder.updatePermissions;
        const folderUI: UpdateFolderUI[] = [];
        for (const update of updatePermissions) {
          const folder = new SmallFolder();
          folder.id = update.entityId;
          folder.refTypeId = update.refTypeId;
          folder.isCanEdit = folder.refTypeId === RefTypeENUM.Editor;
          this.store.dispatch(new UpdateOneFolder(folder, folder.id));

          // FULL FOLDER
          this.store.dispatch(new UpdateFullFolder(folder, folder.id));

          // UI
          const updateUIFolder = new UpdateFolderUI(update.entityId);
          updateUIFolder.isCanEdit = folder.isCanEdit;
          folderUI.push(updateUIFolder);
        }
        this.store.dispatch(new PatchUpdatesUIFolders(folderUI));
      },
    );
  };
}
