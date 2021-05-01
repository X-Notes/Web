import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchNotesFolders } from 'src/app/core/models/search/searchNotesFolders';
import { environment } from 'src/environments/environment';
import { SearchUserForShareModal } from '../models/shortUserForShareModal';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private httpClient: HttpClient) {}

  searchUsers(str: string) {
    const obj = {
      searchString: str,
    };
    return this.httpClient.post<SearchUserForShareModal[]>(
      `${environment.writeAPI}/api/search/share/modal`,
      obj,
    );
  }

  searchNotesAndFolder(str: string) {
    const obj = {
      searchString: str,
    };
    return this.httpClient.post<SearchNotesFolders>(
      `${environment.writeAPI}/api/search/search`,
      obj,
    );
  }
}
