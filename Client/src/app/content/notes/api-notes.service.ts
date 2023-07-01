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
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { SmallNote } from './models/small-note.model';
import { Notes } from './state/notes.model';
import { InvitedUsersToNoteOrFolder } from './models/invited-users-to-note.model';
import { OnlineUsersNote } from './models/online-users-note.model';
import { BottomNoteContent } from './models/bottom-note-content.model';
import { LongTermOperationsHandlerService } from '../long-term-operations-handler/services/long-term-operations-handler.service';
import {
  LongTermOperation,
  OperationDetailMini,
} from '../long-term-operations-handler/models/long-term-operation';
import { PositionEntityModel } from './models/position-note.model';
import { FullNote } from './models/full-note.model';
import { CopyNoteResult } from './models/copy-note-result';

@Injectable()
export class ApiServiceNotes {
  constructor(
    private httpClient: HttpClient,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
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
        map((q) => TransformNoteUtil.transformNotes(q)),
        map((notes) => new Notes(type, notes)),
      );
  }

  getNotesMany(noteIds: string[], settings: PersonalizationSetting) {
    const obj = {
      noteIds,
      settings,
    };

    return this.httpClient
      .post<OperationResult<SmallNote[]>>(`${environment.writeAPI}/api/note/many`, obj)
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
      `${environment.writeAPI}/api/note/additional`,
      obj,
    );
  }

  addLabel(labelId: string, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/label/add`,
      obj,
    );
  }

  updateOrder(positions: PositionEntityModel[]) {
    const obj = {
      positions,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/order`,
      obj,
    );
  }

  removeLabel(labelId: string, noteIds: string[]) {
    const obj = {
      labelId,
      noteIds,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/label/remove`,
      obj,
    );
  }

  changeColor(ids: string[], color: string) {
    const obj = {
      ids,
      color,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/color`,
      obj,
    );
  }

  setDelete(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<string[]>>(
      `${environment.writeAPI}/api/note/delete`,
      obj,
    );
  }

  makePrivate(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/ref/private`,
      obj,
    );
  }

  copyNotes(
    ids: string[],
    mini: OperationDetailMini,
    operation: LongTermOperation,
    folderId?: string,
  ) {
    const obj = {
      ids,
      folderId,
    };
    return this.httpClient
      .patch<OperationResult<CopyNoteResult[]>>(`${environment.writeAPI}/api/note/copy`, obj, {
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
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/delete/permanently`,
      obj,
    );
  }

  archive(ids: string[]) {
    const obj = {
      ids,
    };
    return this.httpClient.patch<OperationResult<any>>(
      `${environment.writeAPI}/api/note/archive`,
      obj,
    );
  }

  get(noteId: string, folderId: string = null): Observable<OperationResult<FullNote>> {
    let params = new HttpParams();
    if (folderId) {
      params = params.append('folderId', folderId);
    }
    return this.httpClient.get<OperationResult<FullNote>>(
      `${environment.writeAPI}/api/note/${noteId}`,
      {
        params,
      },
    );
  }

  getAll(settings: PersonalizationSetting) {
    const obj = {
      settings,
    };
    return this.httpClient
      .post<SmallNote[]>(`${environment.writeAPI}/api/note/all`, obj)
      .pipe(map((q) => TransformNoteUtil.transformNotes(q)));
  }

  new(): Observable<OperationResult<SmallNote>> {
    return this.httpClient.get<OperationResult<SmallNote>>(`${environment.writeAPI}/api/note/new`);
  }

  getUsersOnPrivateNote(id: string) {
    return this.httpClient.get<InvitedUsersToNoteOrFolder[]>(
      `${environment.writeAPI}/api/share/notes/user/invites/${id}`,
    );
  }

  clearAll(noteId: string) {
    const obj = {
      noteId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/notes/clear`,
      obj,
    );
  }

  makePublic(refTypeId: RefTypeENUM, ids: string[]) {
    const obj = {
      refTypeId,
      ids,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/notes/share`,
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
      `${environment.writeAPI}/api/share/notes/user/invites`,
      obj,
    );
  }

  removeUserFromPrivateNote(noteId: string, permissionUserId: string) {
    const obj = {
      noteId,
      permissionUserId,
    };
    return this.httpClient.post<OperationResult<any>>(
      `${environment.writeAPI}/api/share/notes/user/remove`,
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
      `${environment.writeAPI}/api/share/notes/user/permission`,
      obj,
    );
  }
}
