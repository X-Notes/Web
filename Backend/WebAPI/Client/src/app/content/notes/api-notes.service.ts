import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { finalize, map } from 'rxjs/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { Observable } from 'rxjs';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { TransformNoteUtil } from 'src/app/shared/services/transform-note.util';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { SmallNote } from './models/small-note.model';
import { Notes } from './state/notes.model';
import { InvitedUsersToNoteOrFolder } from './models/invited-users-to-note.model';
import { BottomNoteContent } from './models/bottom-note-content.model';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import { LongTermOperation } from '../long-term-operations-handler/models/long-term-operation';
import { PositionEntityModel } from './models/position-note.model';
import { FullNote } from './models/full-note.model';
import { SyncNoteResult } from './models/sync-note-result';
import { NotesCount } from './models/notes-count.model';

@Injectable()
export class ApiServiceNotes {
  constructor(
    private httpClient: HttpClient,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
  ) { }

  getNotes(type: NoteTypeENUM, takeContents: number) {
    let params = new HttpParams();
    if (takeContents) {
      params = params.append('takeContents', takeContents);
    }
    return this.httpClient
      .get<SmallNote[]>(`${environment.api}/api/note/type/${type}`, { params })
      .pipe(
        map((q) => TransformNoteUtil.transformNotes(q)),
        map((notes) => new Notes(type, notes)),
      );
  }

  getNotesMany(noteIds: string[], takeContents: number) {
    const obj = {
      noteIds,
      takeContents,
    };

    return this.httpClient
      .post<OperationResult<SmallNote[]>>(`${environment.api}/api/note/many`, obj)
      .pipe(
        map((q) => {
          if (q.success) {
            return TransformNoteUtil.transformNotes(q.data);
          }
          return [];
        }),
      );
  }

  getAdditionalInfos(noteIds: string[]) {
    const obj = {
      noteIds,
    };
    return this.httpClient.post<BottomNoteContent[]>(
      `${environment.api}/api/note/additional`,
      obj,
    );
  }

  syncNoteState(noteId: string, version: number, folderId?: string) {
    const obj = {
      noteId,
      folderId,
      version,
    };
    return this.httpClient.patch<OperationResult<SyncNoteResult>>(
      `${environment.api}/api/note/sync/state`,
      obj,
    );
  }

  addLabel(labelId: string, noteIds: string[], connectionId: string) {
    const obj = {
      labelId,
      noteIds,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/label/add`,
      obj,
    );
  }

  updateOrder(positions: PositionEntityModel[]) {
    const obj = {
      positions,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/order`,
      obj,
    );
  }

  removeLabel(labelId: string, noteIds: string[], connectionId: string) {
    const obj = {
      labelId,
      noteIds,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/label/remove`,
      obj,
    );
  }

  changeColor(ids: string[], color: string, connectionId: string) {
    const obj = {
      ids,
      color,
      connectionId
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/color`,
      obj,
    );
  }

  setDelete(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<string[]>>(
      `${environment.api}/api/note/delete`,
      obj,
    );
  }

  makePrivate(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/ref/private`,
      obj,
    );
  }

  copyNotes(
    ids: string[],
    operation: LongTermOperation,
    folderId?: string,
  ) {
    const obj = {
      ids,
      folderId,
    };
    return this.httpClient
      .patch<OperationResult<void>>(`${environment.api}/api/note/copy`, obj)
      .pipe(finalize(() => this.longTermOperationsHandler.finalize(operation)));
  }

  deleteNotes(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/delete/permanently`,
      obj,
    );
  }

  archive(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.api}/api/note/archive`,
      obj,
    );
  }

  get(noteId: string, folderId: string = null): Observable<OperationResult<FullNote>> {
    let params = new HttpParams();
    if (folderId) {
      params = params.append('folderId', folderId);
    }
    return this.httpClient.get<OperationResult<FullNote>>(
      `${environment.api}/api/note/${noteId}`,
      {
        params,
      },
    );
  }

  getAll(takeContents: number) {
    const obj = {
      takeContents,
    };
    return this.httpClient
      .post<SmallNote[]>(`${environment.api}/api/note/all`, obj)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  getCount(): Observable<NotesCount[]> {
    return this.httpClient.get<NotesCount[]>(`${environment.api}/api/note/count`);
  }

  new(): Observable<OperationResult<SmallNote>> {
    return this.httpClient.get<OperationResult<SmallNote>>(`${environment.api}/api/note/new`);
  }

  getUsersOnPrivateNote(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(
      `${environment.api}/api/share/notes/user/invites/${id}`,
    );
  }

  clearAll(noteId: string) {
    const obj = {
      noteId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.api}/api/share/notes/clear`,
      obj,
    );
  }

  makePublic(refTypeId: RefTypeENUM, ids: string[]) {
    const obj = {
      refTypeId,
      ids,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.api}/api/share/notes/share`,
      obj,
    );
  }

  sendInvitesToNote(userIds: string[], noteId: string, refTypeId: RefTypeENUM) {
    const obj = {
      userIds,
      noteId,
      refTypeId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.api}/api/share/notes/user/invites`,
      obj,
    );
  }

  removeUserFromPrivateNote(noteId: string, permissionUserId: string) {
    const obj = {
      noteId,
      permissionUserId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.api}/api/share/notes/user/remove`,
      obj,
    );
  }

  changeUserPermission(noteId: string, permissionUserId: string, accessTypeId: RefTypeENUM) {
    const obj = {
      noteId,
      permissionUserId,
      accessTypeId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.api}/api/share/notes/user/permission`,
      obj,
    );
  }
}
