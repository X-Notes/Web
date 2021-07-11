import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NotesUpdaterService {
  ids$ = new BehaviorSubject<string[]>([]);
}
