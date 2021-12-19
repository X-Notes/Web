import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { Observable } from 'rxjs';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { SmallNote } from './models/small-note.model';
import { RequestFullNote } from './models/request-full-note.model';
import { Notes } from './state/notes.model';
import { InvitedUsersToNoteOrFolder } from './models/invited-users-to-note.model';
import { OnlineUsersNote } from './models/online-users-note.model';
import { BottomNoteContent } from './models/bottom-note-content.model';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import {
  LongTermOperation,
  OperationDetailMini,
} from '../long-term-operations-handler/models/long-term-operation';
import { ContentModelBase } from './models/editor-models/content-model-base';
import { OperationResult } from 'src/app/shared/models/operation-result.model';

@Injectable()
export class ApiServiceNotes {
  constructor(
    private httpClient: HttpClient,
    protected longTermOperationsHandler: LongTermOperationsHandlerService,
    protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
  ) {}

  getNotes(type: NoteTypeENUM, settings: PersonalizationSetting) {
    let params = new HttpParams();
    if (settings) {
      Object.keys(settings).forEach((key) => {
        params = params.append(key, settings[key]);
      });
    }
    return this.httpClient
      .get<SmallNote[]>(`${environment.writeAPI}/api/note/type/${type}`, { params })
      .pipe(
        map((z) => TransformNoteUtil.transformNotes(z)),
        map((notes) => new Notes(type, notes)),
      );
  }

  getNotesMany(noteIds: string[], settings: PersonalizationSetting) {
    const obj = {
      noteIds,
      settings,
    };

    return this.httpClient
      .post<SmallNote[]>(`${environment.writeAPI}/api/note/many`, obj)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  getAdditionalInfos(noteIds: string[]) {
    const obj = {
      noteIds,
    };
    return this.httpClient.post<BottomNoteContent[]>(
      `${environment.writeAPI}/api/note/additional`,
      obj,
    );
  }

  addLabel(labelId: string, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/label/add`, obj);
  }

  removeLabel(labelId: string, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/label/remove`, obj);
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/color`, obj);
  }

  setDeleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/delete`,
      obj,
    );
  }

  makePrivateNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/ref/private`, obj);
  }

  copyNotes(ids: string[], mini: OperationDetailMini, operation: LongTermOperation) {
    const obj = {
      ids,
    };
    return this.httpClient
      .patch<string[]>(`${environment.writeAPI}/api/note/copy`, obj, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        finalize(() => this.longTermOperationsHandler.finalize(operation, mini)),
        takeUntil(mini.obs),
        (x) => this.snackBarFileProcessingHandler.trackProcess(x, mini),
      );
  }

  deleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/delete/permanently`, obj);
  }

  archiveNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch(`${environment.writeAPI}/api/note/archive`, obj);
  }

  get(id: string) {
    return this.httpClient.get<RequestFullNote>(`${environment.writeAPI}/api/note/${id}`);
  }

  getAll(settings: PersonalizationSetting) {
    const obj = {
      settings,
    };
    return this.httpClient
      .post<SmallNote[]>(`${environment.writeAPI}/api/note/all`, obj)
      .pipe(map((z) => TransformNoteUtil.transformNotes(z)));
  }

  new() {
    return this.httpClient.get<SmallNote>(`${environment.writeAPI}/api/note/new`);
  }

  getUsersOnPrivateNote(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(
      `${environment.writeAPI}/api/share/notes/user/invites/${id}`,
    );
  }

  getOnlineUsersOnNote(id: string) {
    return this.httpClient.get<OnlineUsersNote[]>(
      `${environment.writeAPI}/api/note/inner/users/${id}`,
    );
  }

  makePublic(refTypeId: RefTypeENUM, ids: string[]) {
    const obj = {
      refTypeId,
      ids,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/share`, obj);
  }

  sendInvitesToNote(
    userIds: string[],
    noteId: string,
    refTypeId: RefTypeENUM,
    sendMessage: boolean,
    message: string,
  ) {
    const obj = {
      userIds,
      noteId,
      refTypeId,
      sendMessage,
      message,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/user/invites`, obj);
  }

  removeUserFromPrivateNote(noteId: string, userId: string) {
    const obj = {
      noteId,
      userId,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/user/remove`, obj);
  }

  changeUserPermission(noteId: string, userId: string, accessTypeId: RefTypeENUM) {
    const obj = {
      noteId,
      userId,
      accessTypeId,
    };
    return this.httpClient.post(`${environment.writeAPI}/api/share/notes/user/permission`, obj);
  }

  // CONTENTS

  getContents(noteId: string): Observable<ContentModelBase[]> {
    return this.httpClient
      .get<ContentModelBase[]>(`${environment.writeAPI}/api/note/inner/contents/${noteId}`)
      .pipe(map((x) => TransformNoteUtil.transformContent(x)));
  }

  // LINKS

  getMetaLink(url: string) {
    const obj = {
      url,
    };
    return this.httpClient.post<any>(`${environment.writeAPI}/api/AvoidProxy`, obj);
  }
}
