import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OnlineUsersNote } from 'src/app/content/notes/models/online-users-note.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiEditorUsersService {

  constructor(private httpClient: HttpClient) { }

  getOnlineUsersOnNote(noteId: string) {
    return this.httpClient.get<OnlineUsersNote[]>(
      `${environment.writeAPI}/api/editor/users/${noteId}`,
    );
  }
}
