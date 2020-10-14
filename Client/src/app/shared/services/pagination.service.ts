import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() {

  }
  public startPointToGetData = 650;
  public countNextNotes = 5;
  public countNextFolders = 5;
  public countNextLabels = 25;

  public set = new Set();
  public nextPagination = new Subject();

  newPage() {
    this.set.clear();
  }

}
