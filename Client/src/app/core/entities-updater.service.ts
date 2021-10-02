import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UpdaterEntitiesService {
  notesIds$ = new BehaviorSubject<string[]>([]);

  foldersIds$ = new BehaviorSubject<string[]>([]);
}
